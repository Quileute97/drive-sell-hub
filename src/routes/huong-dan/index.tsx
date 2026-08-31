import { createFileRoute } from "@tanstack/react-router";
import Guides from "@/pages/Guides";
import { buildHead, SITE_URL } from "@/lib/seoHead";

export const Route = createFileRoute("/huong-dan/")({
  head: () => {
    const path = "/huong-dan";
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Hướng dẫn & Cẩm nang", item: `${SITE_URL}${path}` },
      ],
    };

    return buildHead({
      title: "Cẩm nang học tập & Hướng dẫn mua bán tài liệu digital",
      description:
        "Tổng hợp hướng dẫn luyện thi IELTS, tài liệu ôn thi vào 10, cẩm nang học Y khoa, viết luận văn tiếng Anh và mẹo mua tài liệu online an toàn trên Salemylink.",
      path,
      keywords:
        "cẩm nang học tập, hướng dẫn ôn thi, tài liệu ielts, de thi vao 10, hoc y khoa, viet luan van, salemylink",
      structuredData: breadcrumb,
    });
  },
  component: Guides,
});
