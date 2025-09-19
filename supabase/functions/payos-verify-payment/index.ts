import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYOS_API_KEY = Deno.env.get("PAYOS_API_KEY");
const PAYOS_CLIENT_ID = Deno.env.get("PAYOS_CLIENT_ID");
const PAYOS_CHECKSUM_KEY = Deno.env.get("PAYOS_CHECKSUM_KEY");

// PayOS API endpoints
const PAYOS_BASE_URL = "https://api-merchant.payos.vn";

// Verify PayOS webhook signature
function verifyPayOSSignature(data: any, signature: string): boolean {
  const sortedKeys = Object.keys(data).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${data[key]}`)
    .join('&');
    
  const expectedSignature = createHmac('sha256', PAYOS_CHECKSUM_KEY!)
    .update(signatureString)
    .digest('hex');
    
  return expectedSignature === signature;
}

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

    if (req.method === "POST") {
      // Handle PayOS webhook
      const webhookData = await req.json();
      console.log("PayOS Webhook received:", webhookData);

      // Verify signature if present
      const signature = req.headers.get('x-payos-signature');
      if (signature && !verifyPayOSSignature(webhookData.data, signature)) {
        throw new Error("Invalid webhook signature");
      }

      const { orderCode, code, desc, success } = webhookData.data || webhookData;
      
      if (success) {
        // Payment successful - update order status
        const { data: payment } = await supabaseClient
          .from("payments")
          .select("order_id")
          .eq("payment_id", orderCode.toString())
          .single();

        if (payment) {
          // Update payment status
          await supabaseClient
            .from("payments")
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
              gateway_response: webhookData
            })
            .eq("payment_id", orderCode.toString());

          // Update order status
          await supabaseClient
            .from("orders")
            .update({
              status: 'paid'
            })
            .eq("id", payment.order_id);
        }
      } else {
        // Payment failed - update status
        await supabaseClient
          .from("payments")
          .update({
            status: 'failed',
            gateway_response: webhookData
          })
          .eq("payment_id", orderCode.toString());
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle GET request to check payment status
    const url = new URL(req.url);
    const orderCode = url.searchParams.get('orderCode');
    
    if (!orderCode) {
      throw new Error("Order code is required");
    }

    // Get payment status from PayOS
    const payosResponse = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests/${orderCode}`, {
      method: "GET",
      headers: {
        "x-client-id": PAYOS_CLIENT_ID!,
        "x-api-key": PAYOS_API_KEY!,
      }
    });

    if (!payosResponse.ok) {
      throw new Error(`PayOS API error: ${payosResponse.status}`);
    }

    const payosResult = await payosResponse.json();
    console.log("PayOS Status Check:", payosResult);

    // Update local database based on PayOS status
    const paymentStatus = payosResult.data.status;
    let dbStatus = 'pending';
    let orderStatus = 'pending';
    
    if (paymentStatus === 'PAID') {
      dbStatus = 'completed';
      orderStatus = 'paid';
    } else if (paymentStatus === 'CANCELLED') {
      dbStatus = 'failed';
      orderStatus = 'cancelled';
    }

    // Update payment record
    const { data: payment } = await supabaseClient
      .from("payments")
      .select("order_id")
      .eq("payment_id", orderCode)
      .single();

    if (payment) {
      await supabaseClient
        .from("payments")
        .update({
          status: dbStatus,
          gateway_response: payosResult,
          ...(dbStatus === 'completed' && { processed_at: new Date().toISOString() })
        })
        .eq("payment_id", orderCode);

      // Update order status
      const { data: order } = await supabaseClient
        .from("orders")
        .update({
          status: orderStatus,
          ...(orderStatus === 'paid' && {
            download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
        })
        .eq("id", payment.order_id)
        .select(`
          *,
          products(*)
        `)
        .single();

      // If paid, provide download link
      if (orderStatus === 'paid' && order?.products?.google_drive_link) {
        await supabaseClient
          .from("orders")
          .update({
            download_link: order.products.google_drive_link
          })
          .eq("id", payment.order_id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        data: payosResult.data
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error verifying PayOS payment:", error);
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