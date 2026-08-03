import { createFileRoute } from "@tanstack/react-router";
import SellerProfile from "@/pages/SellerProfile";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/seller/$sellerId")({
  head: ({ params }) =>
    buildHead({
      title: "Gian hàng người bán",
      description: "Xem hồ sơ người bán, sản phẩm và đánh giá trên Salemylink.",
      path: `/seller/${params.sellerId}`,
    }),
  component: SellerProfile,
});
