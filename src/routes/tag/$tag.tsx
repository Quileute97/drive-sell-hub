import { createFileRoute } from "@tanstack/react-router";
import TagProducts from "@/pages/TagProducts";
import { getTagSeo } from "@/data/seoOverrides";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { buildProductSchema } from "@/lib/productSchemaBuilder";

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
        itemListElement: items.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: buildProductSchema({
            id: p.id,
            slug: p.slug,
            name: p.title,
            description: (p as any).description || (p as any).short_description,
            price: p.price,
            categoryName: (p as any).categories?.name,
            categorySlug: (p as any).categories?.slug,
            sellerName: (p as any).profiles?.full_name || "Salemylink.com",
            thumbnail_url: p.thumbnail_url,
            images: (p as any).images,
            google_drive_link: p.google_drive_link,
            ratingValue: p.rating_average,
            ratingCount: p.rating_count,
            createdAt: p.created_at,
          }),
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
  component: TagRoutePage,
});

function TagRoutePage() {
  const loaderData = Route.useLoaderData();
  return <TagProducts initialProducts={loaderData?.items} />;
}
