import { createFileRoute } from "@tanstack/react-router";
import Category from "@/pages/Category";
import { getCategorySeo } from "@/data/seoOverrides";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    try {
      const { data: category } = await supabase
        .from("categories")
        .select("id, name")
        .eq("slug", params.slug)
        .maybeSingle();
      if (!category) return { name: null, items: [] };
      const { data } = await supabase
        .from("products")
        .select("title, slug, thumbnail_url")
        .eq("status", "active")
        .eq("category_id", category.id)
        .order("download_count", { ascending: false })
        .limit(20);
      return { name: category.name as string, items: data || [] };
    } catch {
      return { name: null, items: [] };
    }
  },
  head: ({ params, loaderData }) => {
    const fallbackName = decodeURIComponent(params.slug)
      .split("-")
      .join(" ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const name = loaderData?.name || fallbackName;
    const seo = getCategorySeo(params.slug, name);
    const path = `/category/${params.slug}`;
    const items = loaderData?.items ?? [];
    const structuredData: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
          { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
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
  component: Category,
});
