import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { productId, quantity = 1 } = await req.json();

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select("*, profiles!seller_id(*)")
      .eq("id", productId)
      .eq("status", "active")
      .single();

    if (productError || !product) {
      throw new Error("Product not found or inactive");
    }

    // Get buyer profile
    const { data: buyerProfile, error: buyerError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (buyerError || !buyerProfile) {
      throw new Error("Buyer profile not found");
    }

    // Calculate amounts
    const unitPrice = product.price;
    const totalAmount = unitPrice * quantity;
    const commissionRate = product.profiles.seller_commission_rate || 15.00;
    const commissionAmount = (totalAmount * commissionRate) / 100;
    const sellerAmount = totalAmount - commissionAmount;

    // Generate order number
    const { data: orderNumberData } = await supabaseClient
      .rpc("generate_order_number");
    
    const orderNumber = orderNumberData || `ORD${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: productId,
        order_number: orderNumber,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        buyer_email: user.email,
        buyer_name: buyerProfile.full_name || user.email?.split('@')[0],
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create pending payment record
    const { error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        order_id: order.id,
        payment_method: 'pending',
        amount: totalAmount,
        currency: 'VND',
        status: 'pending'
      });

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          product_title: product.title,
          seller_name: product.profiles.full_name
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating order:", error);
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