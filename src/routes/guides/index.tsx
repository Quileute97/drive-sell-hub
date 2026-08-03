import { createFileRoute } from "@tanstack/react-router";
import Guides from "@/pages/Guides";
import { buildHead } from "@/lib/seoHead";

export const Route = createFileRoute("/guides/")({
  head: () =>
    buildHead({
      title: "Cẩm nang học tập & luyện thi",
      description:
        "Tổng hợp hướng dẫn học Y khoa, luyện thi IELTS, viết luận văn tốt nghiệp kèm tài liệu thực tế trên Salemylink.",
      path: "/guides",
      keywords: "cẩm nang học tập, hướng dẫn học y khoa, luyện thi ielts, viết luận văn",
    }),
  component: Guides,
});
