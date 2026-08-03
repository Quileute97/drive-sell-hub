import { createFileRoute } from "@tanstack/react-router";
import TagProducts from "@/pages/TagProducts";
import { getTagSeo } from "@/data/seoOverrides";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

export const Route = createFileRoute("/tag/$tag")({
  loader: async ({ params }) => {
    try {
      const { data } = await supabase
        .from("products")
        .select("title, slug, thumbnail_url, price")
        .eq("status", "active")
        .contains("tags", [decodeURIComponent(params.tag)])
        .order("download_count", { ascending: false })
        .limit(20);
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
        itemListElement: items.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: fixVietnameseEncoding(p.title),
          url: `${SITE_URL}/product/${p.slug}`,
          ...(p.thumbnail_url ? { image: p.thumbnail_url } : {}),
        })),
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
  component: TagProducts,
});
