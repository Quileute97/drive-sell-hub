import { createFileRoute } from "@tanstack/react-router";
import Category from "@/pages/Category";
import { getCategorySeo } from "@/data/seoOverrides";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { buildProductSchema } from "@/lib/productSchemaBuilder";

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
        .select("id, slug, title, short_description, description, price, original_price, rating_average, rating_count, download_count, view_count, google_drive_link, thumbnail_url, images, created_at, updated_at, file_format, profiles!products_seller_id_fkey(full_name)")
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
  head: ({ loaderData, params }) => {
    const catName = loaderData?.name || params.slug;
    const catDesc = loaderData?.description || "";
    const items = loaderData?.items || [];
    const seo = getCategorySeo(params.slug, catName, catDesc);
    const path = `/danh-muc/${params.slug}`;

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: catName, item: `${SITE_URL}${path}` },
      ],
    };

    const collectionPage = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${SITE_URL}${path}#collection`,
      name: seo.title,
      description: seo.description,
      url: `${SITE_URL}${path}`,
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
          item: buildProductSchema({
            id: p.id,
            slug: p.slug,
            name: p.title,
            description: (p as any).description || (p as any).short_description,
            price: p.price,
            categoryName: catName,
            categorySlug: params.slug,
            sellerName: (p as any).profiles?.full_name || "Salemylink.com",
            thumbnail_url: p.thumbnail_url,
            images: (p as any).images,
            google_drive_link: p.google_drive_link,
            ratingValue: p.rating_average,
            ratingCount: p.rating_count,
            createdAt: p.created_at,
          }),
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
  component: CategoryRoutePage,
});

function CategoryRoutePage() {
  const loaderData = Route.useLoaderData();
  return <Category initialCategory={loaderData?.category} initialProducts={loaderData?.products} />;
}
