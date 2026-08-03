import { createFileRoute } from "@tanstack/react-router";
import TermsOfService from "@/pages/TermsOfService";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/terms-of-service")({
  head: () =>
    buildHead({
      title: "Điều khoản dịch vụ",
      description: "Điều khoản sử dụng dịch vụ Salemylink dành cho người mua và người bán sản phẩm digital.",
      path: "/terms-of-service",
    }),
  component: TermsOfService,
});
