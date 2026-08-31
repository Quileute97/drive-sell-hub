import { createFileRoute } from "@tanstack/react-router";
import Sellers from "@/pages/Sellers";
import { buildHead, SITE_URL } from "@/lib/seoHead";

export const Route = createFileRoute("/nguoi-ban/")({
  head: () => {
    const path = "/nguoi-ban";
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Người bán", item: `${SITE_URL}${path}` },
      ],
    };

    return buildHead({
      title: "Danh sách người bán nổi bật – Gian hàng số uy tín",
      description:
        "Khám phá các gian hàng người bán uy tín trên Salemylink: tài liệu học tập, ebook, template và tài nguyên số được xác thực chất lượng.",
      path,
      keywords: "người bán salemylink, gian hàng số, seller uy tín, shop tài liệu, mua ebook",
      structuredData: breadcrumb,
    });
  },
  component: Sellers,
});
