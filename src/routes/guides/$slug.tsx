import { createFileRoute } from "@tanstack/react-router";
import GuideDetail from "@/pages/GuideDetail";
import { getGuideBySlug } from "@/data/guides";
import { buildHead, SITE_URL } from "@/lib/seoHead";

export const Route = createFileRoute("/guides/$slug")({
  head: ({ params }) => {
    const guide = getGuideBySlug(params.slug);
    const path = `/guides/${params.slug}`;
    if (!guide) {
      return buildHead({
        title: "Cẩm nang học tập",
        description: "Hướng dẫn học tập, luyện thi và tài liệu chọn lọc trên Salemylink.",
        path,
        type: "article",
      });
    }
    return buildHead({
      title: guide.title,
      description: guide.description,
      path,
      type: "article",
      keywords: guide.category,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        url: `${SITE_URL}${path}`,
        inLanguage: "vi-VN",
        publisher: { "@type": "Organization", name: "Salemylink.com", url: SITE_URL },
      },
    });
  },
  component: GuideDetail,
});
