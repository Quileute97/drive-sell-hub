import { createFileRoute } from "@tanstack/react-router";
import SearchProducts from "@/pages/SearchProducts";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/search")({
  head: () =>
    buildHead({
      title: "Tìm kiếm sản phẩm",
      description: "Tìm kiếm ebook, tài liệu, khóa học trên Salemylink.",
      path: "/search",
      noindex: true,
    }),
  component: SearchProducts,
});
