import { createFileRoute } from "@tanstack/react-router";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    buildHead({
      title: "Chính sách bảo mật",
      description: "Chính sách bảo mật của Salemylink: cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu người dùng.",
      path: "/privacy-policy",
    }),
  component: PrivacyPolicy,
});
