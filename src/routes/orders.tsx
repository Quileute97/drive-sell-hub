import { createFileRoute } from "@tanstack/react-router";
import Orders from "@/pages/Orders";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/orders")({
  head: () =>
    buildHead({
      title: "Đơn hàng của tôi",
      description: "Xem lại đơn hàng và link tải sản phẩm digital đã mua trên Salemylink.",
      path: "/orders",
      noindex: true,
    }),
  component: Orders,
});

