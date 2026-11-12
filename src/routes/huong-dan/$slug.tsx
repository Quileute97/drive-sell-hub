import { createFileRoute, redirect } from "@tanstack/react-router";
import GuideDetail from "@/pages/GuideDetail";
import { getGuideBySlug } from "@/data/guides";
import { buildHead, SITE_URL } from "@/lib/seoHead";

export const Route = createFileRoute("/huong-dan/$slug")({
  beforeLoad: ({ params }) => {
    const guide = getGuideBySlug(params.slug);
    if (guide && guide.slug !== params.slug) {
      throw redirect({
        to: "/huong-dan/$slug",
        params: { slug: guide.slug },
        statusCode: 301,
      });
    }
  },
  head: ({ params }) => {
    const guide = getGuideBySlug(params.slug);
    if (!guide) {
      return buildHead({
        title: "Cẩm nang học tập",
        description: "Hướng dẫn học tập, luyện thi và tài liệu chọn lọc trên Salemylink.",
        path: `/huong-dan/${params.slug}`,
        type: "article",
        noindex: true,
      });
    }

    const path = `/huong-dan/${guide.slug}`;

    const breadcrumb = {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}${path}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Hướng dẫn", item: `${SITE_URL}/huong-dan` },
        { "@type": "ListItem", position: 3, name: guide.title, item: `${SITE_URL}${path}` },
      ],
    };

    const publishedTime = `${guide.createdAt || guide.updatedAt}T00:00:00+07:00`;
    const modifiedTime = `${guide.updatedAt}T00:00:00+07:00`;

    const articleSchema = {
      "@type": "Article",
      "@id": `${SITE_URL}${path}#article`,
      headline: guide.title,
      description: guide.description,
      datePublished: publishedTime,
      dateModified: modifiedTime,
      url: `${SITE_URL}${path}`,
      inLanguage: "vi-VN",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}${path}`,
      },
      author: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Salemylink.com",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
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
        "@type": "FAQPage",
        "@id": `${SITE_URL}${path}#faq`,
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
      title: guide.metaTitle || guide.title,
      description: guide.description,
      path,
      type: "article",
      keywords: guide.keywords,
      publishedTime,
      modifiedTime,
      structuredData,
    });
  },
  component: GuideDetail,
});
