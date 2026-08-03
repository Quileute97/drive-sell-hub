import { createFileRoute } from "@tanstack/react-router";
import { PaymentSuccess } from "@/pages/PaymentSuccess";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/payment/success")({
  head: () =>
    buildHead({
      title: "Thanh toán thành công",
      description: "Xác nhận thanh toán thành công.",
      path: "/payment/success",
      noindex: true,
    }),
  component: PaymentSuccess,
});
