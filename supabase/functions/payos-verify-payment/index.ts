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
function verifyPayOSSignature(data: unknown, signature: string | null | undefined): boolean {
  if (!PAYOS_CHECKSUM_KEY || !signature || !data || typeof data !== "object") {
    return false;
  }

  const record = data as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const signatureString = sortedKeys
    .map((key) => {
      const val = record[key];
      if (val === null || val === undefined) return `${key}=`;
      if (typeof val === "object") return `${key}=${JSON.stringify(val)}`;
      return `${key}=${String(val)}`;
    })
    .join("&");

  const expectedSignature = createHmac("sha256", PAYOS_CHECKSUM_KEY)
    .update(signatureString)
    .digest("hex")
    .toLowerCase();
  const received = signature.trim().toLowerCase();

  if (expectedSignature.length !== received.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    mismatch |= expectedSignature.charCodeAt(i) ^ received.charCodeAt(i);
  }
  return mismatch === 0;
}

async function finalizePaidOrder(
  supabaseClient: ReturnType<typeof createClient>,
  orderId: string,
  orderCodeStr: string,
  gatewayPayload: unknown,
) {
  const { data: existingPayment } = await supabaseClient
    .from("payments")
    .select("id, status, processed_at")
    .eq("payment_id", orderCodeStr)
    .maybeSingle();

  const nowIso = new Date().toISOString();

  await supabaseClient
    .from("payments")
    .update({
      status: "completed",
      gateway_response: gatewayPayload,
      processed_at: existingPayment?.processed_at || nowIso,
    })
    .eq("payment_id", orderCodeStr);

  const { data: currentOrder } = await supabaseClient
    .from("orders")
    .select(`
      id, status, product_id, seller_id, seller_amount, download_link, download_expires_at,
      products(id, google_drive_link, download_only_link, download_count)
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (!currentOrder) {
    return;
  }

  const product = currentOrder.products;
  const resolvedDownloadLink =
    currentOrder.download_link ||
    product?.google_drive_link ||
    product?.download_only_link ||
    null;
  const resolvedExpiresAt =
    currentOrder.download_expires_at ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Atomically transition from non-delivered -> delivered so stats increment only once
  const { data: transitionedRows } = await supabaseClient
    .from("orders")
    .update({
      status: "delivered",
      download_expires_at: resolvedExpiresAt,
      ...(resolvedDownloadLink ? { download_link: resolvedDownloadLink } : {}),
    })
    .eq("id", orderId)
    .neq("status", "delivered")
    .select("id");

  if (transitionedRows && transitionedRows.length > 0) {
    if (product) {
      await supabaseClient
        .from("products")
        .update({
          download_count: (product.download_count || 0) + 1,
        })
        .eq("id", currentOrder.product_id);
    }

    const { data: seller } = await supabaseClient
      .from("profiles")
      .select("total_sales")
      .eq("user_id", currentOrder.seller_id)
      .maybeSingle();

    if (seller) {
      await supabaseClient
        .from("profiles")
        .update({
          total_sales: Number(seller.total_sales || 0) + Number(currentOrder.seller_amount || 0),
        })
        .eq("user_id", currentOrder.seller_id);
    }
  }
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

      // Verify signature — REQUIRED. Accept either header or PayOS v2 body signature field.
      const signature = req.headers.get("x-payos-signature") || webhookData?.signature;
      if (!signature || !verifyPayOSSignature(webhookData?.data, signature)) {
        console.warn("Rejected PayOS webhook: missing/invalid signature");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payloadData = webhookData?.data || webhookData || {};
      const orderCode = payloadData.orderCode ?? webhookData?.orderCode;
      const dataCode = payloadData.code;
      const isSuccess =
        webhookData?.success === true ||
        payloadData?.success === true ||
        (webhookData?.code === "00" && dataCode === "00");

      if (orderCode !== undefined && orderCode !== null) {
        const orderCodeStr = orderCode.toString();
        const { data: payment } = await supabaseClient
          .from("payments")
          .select("id, order_id, status")
          .eq("payment_id", orderCodeStr)
          .maybeSingle();

        if (payment) {
          if (isSuccess) {
            await finalizePaidOrder(supabaseClient, payment.order_id, orderCodeStr, webhookData);
          } else if (payment.status !== "completed") {
            await supabaseClient
              .from("payments")
              .update({
                status: "failed",
                gateway_response: webhookData,
              })
              .eq("id", payment.id);

            await supabaseClient
              .from("orders")
              .update({
                status: "cancelled",
              })
              .eq("id", payment.order_id)
              .eq("status", "pending");
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle GET request to check payment status — require authenticated buyer or admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const orderCode = url.searchParams.get("orderCode");

    if (!orderCode) {
      throw new Error("Order code is required");
    }

    // Verify order ownership (buyer who owns the order or platform admin)
    const { data: ownership } = await supabaseClient
      .from("payments")
      .select("id, status, order_id, orders!inner(buyer_id, status)")
      .eq("payment_id", orderCode)
      .maybeSingle();

    interface OwnershipRecord {
      id: string;
      status: string | null;
      order_id: string;
      orders?: { buyer_id?: string | null; status?: string | null } | null;
    }

    const typedOwnership = ownership as OwnershipRecord | null;
    const isBuyer = typedOwnership?.orders?.buyer_id === user.id;
    let isAdmin = false;
    if (!isBuyer) {
      const { data: adminRole } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      isAdmin = Boolean(adminRole);
    }

    if (!typedOwnership || (!isBuyer && !isAdmin)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get authoritative payment status from PayOS
    const payosResponse = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests/${orderCode}`, {
      method: "GET",
      headers: {
        "x-client-id": PAYOS_CLIENT_ID!,
        "x-api-key": PAYOS_API_KEY!,
      },
    });

    if (!payosResponse.ok) {
      throw new Error(`PayOS API error: ${payosResponse.status}`);
    }

    const payosResult = await payosResponse.json();
    console.log("PayOS Status Check:", payosResult);

    const paymentStatus = payosResult?.data?.status;
    const existingOrderStatus = typedOwnership.orders?.status;

    if (paymentStatus === "PAID") {
      await finalizePaidOrder(supabaseClient, typedOwnership.order_id, orderCode, payosResult);
    } else if (paymentStatus === "CANCELLED" || paymentStatus === "EXPIRED" || paymentStatus === "FAILED") {
      if (typedOwnership.status !== "completed" && existingOrderStatus !== "delivered") {
        await supabaseClient
          .from("payments")
          .update({
            status: "failed",
            gateway_response: payosResult,
          })
          .eq("id", typedOwnership.id);

        await supabaseClient
          .from("orders")
          .update({
            status: "cancelled",
          })
          .eq("id", typedOwnership.order_id)
          .neq("status", "delivered");
      }
    } else if (typedOwnership.status !== "completed") {
      // PENDING / UNDERPAID / PROCESSING: never mark completed or delivered until PAID
      await supabaseClient
        .from("payments")
        .update({
          status: "pending",
          gateway_response: payosResult,
        })
        .eq("id", typedOwnership.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        data: payosResult.data,
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
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
