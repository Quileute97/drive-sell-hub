import { createFileRoute } from "@tanstack/react-router";
import { Cart } from "@/pages/Cart";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/cart")({
  head: () =>
    buildHead({
      title: "Giỏ hàng",
      description: "Giỏ hàng Salemylink.",
      path: "/cart",
      noindex: true,
    }),
  component: Cart,
});
