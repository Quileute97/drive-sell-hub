import { createFileRoute } from "@tanstack/react-router";
import Auth from "@/pages/Auth";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/auth")({
  head: () =>
    buildHead({
      title: "Đăng nhập / Đăng ký",
      description: "Đăng nhập tài khoản Salemylink để mua và quản lý tài liệu số của bạn.",
      path: "/auth",
      noindex: true,
    }),
  component: Auth,
});
