import { createFileRoute } from "@tanstack/react-router";
import GuideDetail from "@/pages/GuideDetail";
import { getGuideBySlug } from "@/data/guides";
import { buildHead, SITE_URL } from "@/lib/seoHead";

export const Route = createFileRoute("/huong-dan/$slug")({
  head: ({ params }) => {
    const guide = getGuideBySlug(params.slug);
    const path = `/huong-dan/${params.slug}`;
    if (!guide) {
      return buildHead({
        title: "Cẩm nang học tập",
        description: "Hướng dẫn học tập, luyện thi và tài liệu chọn lọc trên Salemylink.",
        path,
        type: "article",
      });
    }

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Hướng dẫn", item: `${SITE_URL}/huong-dan` },
        { "@type": "ListItem", position: 3, name: guide.title, item: `${SITE_URL}${path}` },
      ],
    };

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${SITE_URL}${path}#article`,
      headline: guide.title,
      description: guide.description,
      datePublished: `${guide.createdAt || guide.updatedAt}T00:00:00+07:00`,
      dateModified: `${guide.updatedAt}T00:00:00+07:00`,
      url: `${SITE_URL}${path}`,
      inLanguage: "vi-VN",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}${path}`,
      },
      author: {
        "@type": "Organization",
        name: "Salemylink.com",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "Salemylink.com",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.png`,
        },
      },
      image: `${SITE_URL}/og-image.png`,
      articleSection: guide.category,
      keywords: guide.keywords,
    };

    const structuredData: object[] = [breadcrumb, articleSchema];

    if (guide.faq && guide.faq.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      });
    }

    return buildHead({
      title: guide.title,
      description: guide.description,
      path,
      type: "article",
      keywords: guide.keywords,
      structuredData,
    });
  },
  component: GuideDetail,
});
