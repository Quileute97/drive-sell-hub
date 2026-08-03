import { createFileRoute } from "@tanstack/react-router";
import Wishlist from "@/pages/Wishlist";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/wishlist")({
  head: () =>
    buildHead({
      title: "Danh sách yêu thích",
      description: "Sản phẩm bạn đã lưu trên Salemylink.",
      path: "/wishlist",
      noindex: true,
    }),
  component: Wishlist,
});
