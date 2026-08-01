import { createFileRoute } from "@tanstack/react-router";
import { PaymentCancel } from "@/pages/PaymentCancel";

export const Route = createFileRoute("/payment/cancel")({
  component: PaymentCancel,
});
