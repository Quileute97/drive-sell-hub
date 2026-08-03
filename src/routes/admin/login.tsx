import { createFileRoute } from "@tanstack/react-router";
import AdminAuth from "@/pages/AdminAuth";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/admin/login")({
  head: () =>
    buildHead({
      title: "Đăng nhập quản trị",
      description: "Trang đăng nhập quản trị.",
      path: "/admin/login",
      noindex: true,
    }),
  component: AdminAuth,
});
