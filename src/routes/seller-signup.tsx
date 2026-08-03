import { createFileRoute } from "@tanstack/react-router";
import SellerAuth from "@/pages/SellerAuth";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/seller-signup")({
  head: () =>
    buildHead({
      title: "Đăng ký tài khoản người bán",
      description: "Đăng ký trở thành người bán trên Salemylink chỉ trong vài phút, hoa hồng thấp, thanh toán nhanh.",
      path: "/seller-signup",
    }),
  component: SellerAuth,
});
