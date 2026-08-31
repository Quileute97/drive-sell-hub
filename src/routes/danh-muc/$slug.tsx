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
        .select("id, name, description")
        .eq("slug", params.slug)
        .maybeSingle();
      if (!category) return { name: null, description: null, items: [] };
      const { data } = await supabase
        .from("products")
        .select("title, slug, thumbnail_url, price, rating_average, rating_count")
        .eq("status", "active")
        .eq("category_id", category.id)
        .order("download_count", { ascending: false })
        .limit(20);
      return {
        name: category.name as string,
        description: category.description as string | null,
        items: data || [],
      };
    } catch {
      return { name: null, description: null, items: [] };
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
        itemListElement: items.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: fixVietnameseEncoding(p.title),
          url: `${SITE_URL}/san-pham/${p.slug}`,
          ...(p.thumbnail_url ? { image: p.thumbnail_url } : {}),
        })),
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
  component: Category,
});
