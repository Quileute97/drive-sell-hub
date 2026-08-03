import { createFileRoute } from "@tanstack/react-router";
import SellerDashboard from "@/pages/SellerDashboard";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/seller-dashboard")({
  head: () =>
    buildHead({
      title: "Bảng điều khiển người bán",
      description: "Quản lý sản phẩm, đơn hàng và doanh thu.",
      path: "/seller-dashboard",
      noindex: true,
    }),
  component: SellerDashboard,
});
