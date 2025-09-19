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
    
    const { cartItems } = requestBody;

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

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of cartItems) {
      const productTotal = item.product.price * item.quantity;
      totalAmount += productTotal;
      
      orderItems.push({
        name: item.product.title,
        quantity: item.quantity,
        price: item.product.price
      });
    }

    // Generate unique order code
    const orderCode = Date.now();
    
    // Create PayOS payment request
    const paymentData: PayOSPaymentRequest = {
      orderCode,
      amount: totalAmount,
      description: `Thanh toán đơn hàng #${orderCode}`,
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

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        buyer_id: user.id,
        seller_id: cartItems[0].product.seller_id, // Assuming single seller for now
        product_id: cartItems[0].product.id, // For now, single product
        quantity: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        unit_price: totalAmount / cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        total_amount: totalAmount,
        commission_rate: 15, // 15% commission
        commission_amount: totalAmount * 0.15,
        seller_amount: totalAmount * 0.85,
        status: 'pending',
        order_number: `ORD${orderCode}`,
        buyer_email: user.email,
        buyer_name: profile.full_name
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