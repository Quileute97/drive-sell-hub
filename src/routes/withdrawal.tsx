import { createFileRoute } from "@tanstack/react-router";
import Withdrawal from "@/pages/Withdrawal";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/withdrawal")({
  head: () =>
    buildHead({
      title: "Rút tiền",
      description: "Quản lý yêu cầu rút tiền của người bán.",
      path: "/withdrawal",
      noindex: true,
    }),
  component: Withdrawal,
});
