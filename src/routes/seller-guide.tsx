import { createFileRoute } from "@tanstack/react-router";
import SellerGuide from "@/pages/SellerGuide";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/seller-guide")({
  head: () =>
    buildHead({
      title: "Hướng dẫn bán hàng trên Salemylink",
      description: "Hướng dẫn chi tiết cách đăng sản phẩm, đặt giá, tối ưu SEO và rút tiền khi bán tài liệu số trên Salemylink.",
      path: "/seller-guide",
    }),
  component: SellerGuide,
});
