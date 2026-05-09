import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYOS_CLIENT_ID = Deno.env.get("PAYOS_CLIENT_ID");
const PAYOS_API_KEY = Deno.env.get("PAYOS_API_KEY");
const PAYOS_CHECKSUM_KEY = Deno.env.get("PAYOS_CHECKSUM_KEY");

// PayOS API endpoints
const PAYOS_BASE_URL = "https://api-merchant.payos.vn";

interface PayOSPaymentRequest {
  orderCode: number;
  amount: number;
  description: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  returnUrl: string;
  cancelUrl: string;
  expiredAt?: number;
}

// Generate PayOS signature
function generatePayOSSignature(data: any): string {
  const sortedKeys = Object.keys(data).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${data[key]}`)
    .join('&');
    
  return createHmac('sha256', PAYOS_CHECKSUM_KEY!)
    .update(signatureString)
    .digest('hex');
}

serve(async (req) => {
  console.log("=== PayOS Create Payment Function Called ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", req.headers);
  
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating Supabase client...");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted, length:", token.length);
    
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    console.log("User authenticated:", !!user, user?.email);

    if (!user) {
      throw new Error("User not authenticated");
    }

    const requestBody = await req.json();
    console.log("Request body received:", requestBody);
    
    const { cartItems, affiliateCode } = requestBody;

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    console.log("Cart items count:", cartItems.length);

    // Get user profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      throw new Error("User profile not found");
    }

    // Fetch full product details including seller_id
    const productIds = cartItems.map((item: any) => item.product_id);
    const { data: products, error: productsError } = await supabaseClient
      .from("products")
      .select("id, seller_id, title, price")
      .in("id", productIds);

    if (productsError || !products) {
      console.error("Error fetching products:", productsError);
      throw new Error("Failed to fetch product details");
    }

    // Create a map for quick product lookup
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }
      
      const productTotal = product.price * item.quantity;
      totalAmount += productTotal;
      
      orderItems.push({
        name: product.title.substring(0, 50), // Limit name length
        quantity: item.quantity,
        price: product.price
      });
    }

    // Generate unique order code
    const orderCode = Date.now();
    const shortOrderCode = orderCode.toString().slice(-8); // Last 8 digits
    
    // Create PayOS payment request with short description (max 25 chars)
    const paymentData: PayOSPaymentRequest = {
      orderCode,
      amount: totalAmount,
      description: `DH${shortOrderCode}`, // "DH" + 8 digits = 10 chars
      buyerName: profile.full_name || user.email || "",
      buyerEmail: user.email || "",
      items: orderItems,
      returnUrl: `${req.headers.get("origin") || "https://localhost:3000"}/payment/success`,
      cancelUrl: `${req.headers.get("origin") || "https://localhost:3000"}/payment/cancel`,
      expiredAt: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes from now
    };

    // Generate signature
    const signatureData = {
      amount: paymentData.amount,
      cancelUrl: paymentData.cancelUrl,
      description: paymentData.description,
      orderCode: paymentData.orderCode,
      returnUrl: paymentData.returnUrl
    };
    
    const signature = generatePayOSSignature(signatureData);

    // Call PayOS API to create payment link
    const payosResponse = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests`, {
      method: "POST",
      headers: {
        "x-client-id": PAYOS_CLIENT_ID!,
        "x-api-key": PAYOS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...paymentData,
        signature
      })
    });

    if (!payosResponse.ok) {
      const errorText = await payosResponse.text();
      console.error("PayOS API Error:", errorText);
      throw new Error(`PayOS API error: ${payosResponse.status}`);
    }

    const payosResult = await payosResponse.json();
    
    console.log("PayOS Response:", payosResult);

    // Get first product's seller_id (assuming single seller per order for now)
    const firstProduct = productMap.get(cartItems[0].product_id);
    if (!firstProduct || !firstProduct.seller_id) {
      throw new Error("Product seller information not found");
    }

    // Resolve affiliate code to id (skip if buyer is the affiliate themselves)
    let affiliateId: string | null = null;
    if (affiliateCode) {
      const { data: affRow } = await supabaseClient
        .from("affiliates")
        .select("id, user_id")
        .eq("code", affiliateCode)
        .eq("status", "active")
        .maybeSingle();
      if (affRow && affRow.user_id !== user.id) {
        affiliateId = affRow.id;
      }
    }

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        buyer_id: user.id,
        seller_id: firstProduct.seller_id,
        product_id: cartItems[0].product_id, // For now, single product
        quantity: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        unit_price: totalAmount / cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        total_amount: totalAmount,
        commission_rate: 15, // 15% commission
        commission_amount: totalAmount * 0.15,
        seller_amount: totalAmount * 0.85,
        status: 'pending',
        order_number: `ORD${orderCode}`,
        buyer_email: user.email,
        buyer_name: profile.full_name,
        affiliate_id: affiliateId
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create payment record
    const { error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        order_id: order.id,
        amount: totalAmount,
        status: 'pending',
        payment_method: 'payos',
        payment_id: orderCode.toString(),
        gateway_response: payosResult
      });

    if (paymentError) {
      console.error("Payment record creation error:", paymentError);
    }

    // Clear cart after successful order creation
    const { error: clearCartError } = await supabaseClient
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (clearCartError) {
      console.error("Failed to clear cart:", clearCartError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: payosResult.data.checkoutUrl,
        orderCode,
        orderId: order.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating PayOS payment:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});