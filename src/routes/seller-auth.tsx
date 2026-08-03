import { createFileRoute } from "@tanstack/react-router";
import SellerAuth from "@/pages/SellerAuth";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/seller-auth")({
  head: () =>
    buildHead({
      title: "Đăng ký bán hàng trên Salemylink",
      description: "Mở gian hàng số miễn phí trên Salemylink, bán ebook, tài liệu, khóa học qua Google Drive.",
      path: "/seller-auth",
    }),
  component: SellerAuth,
});
