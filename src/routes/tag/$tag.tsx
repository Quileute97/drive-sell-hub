import { createFileRoute } from "@tanstack/react-router";
import TagProducts from "@/pages/TagProducts";
import { getTagSeo } from "@/data/seoOverrides";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

export const Route = createFileRoute("/tag/$tag")({
  loader: async ({ params }) => {
    try {
      const decoded = decodeURIComponent(params.tag || "");
      const { data } = await supabase
        .from("products")
        .select(`*, profiles!products_seller_id_fkey(full_name), categories(id, name, slug)`)
        .eq("status", "active")
        .contains("tags", [decoded])
        .order("download_count", { ascending: false })
        .limit(24);
      return { items: data || [] };
    } catch {
      return { items: [] };
    }
  },
  head: ({ params, loaderData }) => {
    const tag = decodeURIComponent(params.tag);
    const seo = getTagSeo(tag);
    const path = `/tag/${params.tag}`;
    const items = loaderData?.items ?? [];
    const structuredData: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: `Tag: ${tag}`, item: `${SITE_URL}${path}` },
        ],
      },
    ];
    if (items.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
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
      });
    }
    return buildHead({
      title: seo.title,
      description: seo.description,
      path,
      keywords: seo.keywords,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      twTitle: seo.twTitle,
      twDescription: seo.twDescription,
      structuredData,
    });
  },
  component: TagRoutePage,
});

function TagRoutePage() {
  const loaderData = Route.useLoaderData();
  return <TagProducts initialProducts={loaderData?.items} />;
}
