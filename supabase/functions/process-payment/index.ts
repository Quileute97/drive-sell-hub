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

    const { orderId, paymentMethod, paymentId } = await req.json();

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select(`
        *,
        products(*),
        profiles!buyer_id(*)
      `)
      .eq("id", orderId)
      .eq("buyer_id", user.id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    if (order.status !== 'pending') {
      throw new Error("Order is not in pending status");
    }

    // Update payment record
    const { error: paymentUpdateError } = await supabaseClient
      .from("payments")
      .update({
        payment_method: paymentMethod,
        payment_id: paymentId,
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq("order_id", orderId);

    if (paymentUpdateError) {
      throw new Error(`Failed to update payment: ${paymentUpdateError.message}`);
    }

    // Calculate download expiry (7 days from now)
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 7);

    // Update order status and provide download link
    const { error: orderUpdateError } = await supabaseClient
      .from("orders")
      .update({
        status: 'paid',
        download_link: order.products.google_drive_link,
        download_expires_at: downloadExpiresAt.toISOString()
      })
      .eq("id", orderId);

    if (orderUpdateError) {
      throw new Error(`Failed to update order: ${orderUpdateError.message}`);
    }

    // Update product download count
    const { error: productUpdateError } = await supabaseClient
      .from("products")
      .update({
        download_count: (order.products.download_count || 0) + 1
      })
      .eq("id", order.product_id);

    if (productUpdateError) {
      console.error("Failed to update product download count:", productUpdateError);
    }

    // Update buyer's total purchases
    const { error: buyerUpdateError } = await supabaseClient
      .from("profiles")
      .update({
        total_purchases: (order.profiles.total_purchases || 0) + order.total_amount
      })
      .eq("user_id", user.id);

    if (buyerUpdateError) {
      console.error("Failed to update buyer stats:", buyerUpdateError);
    }

    // Update seller's total sales
    const { error: sellerUpdateError } = await supabaseClient
      .from("profiles")
      .update({
        total_sales: order.seller_amount
      })
      .eq("user_id", order.seller_id);

    if (sellerUpdateError) {
      console.error("Failed to update seller stats:", sellerUpdateError);
    }

    // Log analytics event
    const { error: analyticsError } = await supabaseClient
      .from("analytics")
      .insert({
        entity_type: 'purchase',
        entity_id: order.product_id,
        user_id: user.id,
        metadata: {
          order_id: orderId,
          product_id: order.product_id,
          amount: order.total_amount,
          payment_method: paymentMethod
        }
      });

    if (analyticsError) {
      console.error("Failed to log analytics:", analyticsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment processed successfully",
        download_link: order.products.google_drive_link,
        download_expires_at: downloadExpiresAt.toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing payment:", error);
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