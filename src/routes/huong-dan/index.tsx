import { createFileRoute } from "@tanstack/react-router";
import Guides from "@/pages/Guides";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { GUIDES } from "@/data/guides";

export const Route = createFileRoute("/huong-dan/")({
  head: () => {
    const path = "/huong-dan";
    const breadcrumb = {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}${path}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Hướng dẫn & Cẩm nang", item: `${SITE_URL}${path}` },
      ],
    };

    const collectionPage = {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}${path}#collection`,
      name: "Cẩm nang học tập & Hướng dẫn mua bán tài liệu digital",
      description:
        "Tổng hợp hướng dẫn luyện thi IELTS, tài liệu ôn thi vào 10, cẩm nang học Y khoa, viết luận văn tiếng Anh và mẹo mua tài liệu online an toàn trên Salemylink.",
      url: `${SITE_URL}${path}`,
      inLanguage: "vi-VN",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
      },
      mainEntity: {
        "@type": "ItemList",
        name: "Danh sách cẩm nang & hướng dẫn học tập",
        numberOfItems: GUIDES.length,
        itemListElement: GUIDES.map((g, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Article",
            "@id": `${SITE_URL}/huong-dan/${g.slug}#article`,
            headline: g.title,
            description: g.description,
            url: `${SITE_URL}/huong-dan/${g.slug}`,
            datePublished: `${g.createdAt}T00:00:00+07:00`,
            dateModified: `${g.updatedAt}T00:00:00+07:00`,
            author: {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Salemylink.com",
            },
          },
        })),
      },
    };

    return buildHead({
      title: "Cẩm nang học tập & Hướng dẫn mua bán tài liệu digital",
      description:
        "Tổng hợp hướng dẫn luyện thi IELTS, tài liệu ôn thi vào 10, cẩm nang học Y khoa, viết luận văn tiếng Anh và mẹo mua tài liệu online an toàn trên Salemylink.",
      path,
      keywords:
        "cẩm nang học tập, hướng dẫn ôn thi, tài liệu ielts, de thi vao 10, hoc y khoa, viet luan van, salemylink",
      structuredData: [breadcrumb, collectionPage],
    });
  },
  component: Guides,
});
