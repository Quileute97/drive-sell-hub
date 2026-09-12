import { createFileRoute } from "@tanstack/react-router";
import Category from "@/pages/Category";
import { getCategorySeo } from "@/data/seoOverrides";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

export const Route = createFileRoute("/danh-muc/$slug")({
  loader: async ({ params }) => {
    try {
      const { data: category } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", params.slug)
        .maybeSingle();

      if (!category) {
        return {
          category: null,
          products: [],
          name: null,
          description: null,
          items: [],
        };
      }

      const { data: products } = await supabase
        .from("products")
        .select("id, slug, title, short_description, price, original_price, rating_average, rating_count, download_count, view_count, google_drive_link, thumbnail_url, created_at, updated_at, file_format")
        .eq("status", "active")
        .eq("category_id", category.id)
        .order("created_at", { ascending: false })
        .limit(24);

      return {
        category,
        products: products || [],
        name: category.name as string,
        description: category.description as string | null,
        items: products || [],
      };
    } catch {
      return {
        category: null,
        products: [],
        name: null,
        description: null,
        items: [],
      };
    }
  },
  head: ({ params, loaderData }) => {
    const fallbackName = decodeURIComponent(params.slug)
      .split("-")
      .join(" ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const name = loaderData?.name || fallbackName;
    const seo = getCategorySeo(params.slug, name);
    const path = `/danh-muc/${params.slug}`;
    const items = loaderData?.items ?? [];

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
      ],
    };

    const collectionPage = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${SITE_URL}${path}`,
      url: `${SITE_URL}${path}`,
      name: seo.title,
      description: seo.description,
      inLanguage: "vi-VN",
      isPartOf: {
        "@type": "WebSite",
        name: "Salemylink.com",
        url: SITE_URL,
      },
      mainEntity: {
        "@type": "ItemList",
        name: seo.title,
        numberOfItems: items.length,
        itemListElement: items.map((p, i) => {
          const imgUrl = p.thumbnail_url && !p.thumbnail_url.includes("placeholder")
            ? (p.thumbnail_url.startsWith("http") ? p.thumbnail_url : `${SITE_URL}${p.thumbnail_url.startsWith("/") ? "" : "/"}${p.thumbnail_url}`)
            : `${SITE_URL}/og-image.png`;
          return {
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: fixVietnameseEncoding(p.title),
              url: `${SITE_URL}/san-pham/${p.slug}`,
              image: imgUrl,
              offers: {
                "@type": "Offer",
                price: String(p.price || 0),
                priceCurrency: "VND",
                availability: "https://schema.org/InStock",
              },
              ...(p.rating_count && Number(p.rating_count) > 0
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: Math.min(5, Math.max(1, Math.round(Number(p.rating_average || 5) * 10) / 10)),
                      reviewCount: Number(p.rating_count),
                    },
                  }
                : {}),
            },
          };
        }),
      },
    };

    return buildHead({
      title: seo.title,
      description: seo.description,
      path,
      keywords: seo.keywords,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      twTitle: seo.twTitle,
      twDescription: seo.twDescription,
      structuredData: [breadcrumb, collectionPage],
    });
  },
  component: CategoryRoutePage,
});

function CategoryRoutePage() {
  const loaderData = Route.useLoaderData();
  return <Category initialCategory={loaderData?.category} initialProducts={loaderData?.products} />;
}
