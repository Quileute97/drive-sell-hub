import { createFileRoute } from "@tanstack/react-router";
import HowItWorks from "@/pages/HowItWorks";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    buildHead({
      title: "Cách thức hoạt động của Salemylink",
      description: "Hướng dẫn mua và bán sản phẩm digital trên Salemylink: đăng sản phẩm, thanh toán PayOS, giao hàng tự động.",
      path: "/how-it-works",
    }),
  component: HowItWorks,
});
