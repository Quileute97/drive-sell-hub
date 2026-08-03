import { createFileRoute } from "@tanstack/react-router";
import Affiliate from "@/pages/Affiliate";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/affiliate")({
  head: () =>
    buildHead({
      title: "Chương trình Affiliate – Hoa hồng 5% trọn đời",
      description: "Kiếm tiền cùng Salemylink: nhận 5% hoa hồng từ mỗi đơn hàng và doanh thu người bán bạn giới thiệu.",
      path: "/affiliate",
    }),
  component: Affiliate,
});
