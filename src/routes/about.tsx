import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/about")({
  head: () =>
    buildHead({
      title: "Về Salemylink – Marketplace tài liệu số Việt Nam",
      description: "Tìm hiểu về Salemylink: nền tảng mua bán ebook, tài liệu, khóa học qua Google Drive an toàn cho người Việt.",
      path: "/about",
    }),
  component: About,
});
