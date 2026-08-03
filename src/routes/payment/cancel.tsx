import { createFileRoute } from "@tanstack/react-router";
import { PaymentCancel } from "@/pages/PaymentCancel";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/payment/cancel")({
  head: () =>
    buildHead({
      title: "Thanh toán đã hủy",
      description: "Giao dịch đã bị hủy.",
      path: "/payment/cancel",
      noindex: true,
    }),
  component: PaymentCancel,
});
