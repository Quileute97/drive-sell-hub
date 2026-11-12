import { createFileRoute } from "@tanstack/react-router";
import Category from "@/pages/Category";
import { getCategorySeo } from "@/data/seoOverrides";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { buildProductListItem } from "@/lib/productSchemaBuilder";

export const Route = createFileRoute("/danh-muc/$slug")({
  loader: async ({ params }) => {
    try {
      const { data: category } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_active", true)
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
        .select("id, slug, title, short_description, description, price, original_price, rating_average, rating_count, download_count, view_count, google_drive_link, download_only_link, read_only, thumbnail_url, images, created_at, updated_at, file_format, file_size, tags, seller_id, profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified), categories(id, name, slug)")
        .eq("status", "active")
        .eq("category_id", category.id)
        .order("created_at", { ascending: false })
        .limit(24);

      return {
        category: {
          ...category,
          name: fixVietnameseEncoding(category.name),
          description: category.description ? fixVietnameseEncoding(category.description) : null,
        },
        products: products || [],
        name: fixVietnameseEncoding(category.name),
        description: category.description ? fixVietnameseEncoding(category.description) : null,
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
    const path = `/danh-muc/${params.slug}`;
    if (!loaderData?.category) {
      return buildHead({
        title: "Không tìm thấy danh mục",
        description: "Danh mục này hiện không tồn tại hoặc đã bị ẩn khỏi hệ thống Salemylink.",
        path,
        noindex: true,
      });
    }

    const catName = loaderData.name || params.slug;
    const catDesc = loaderData.description || "";
    const items = loaderData.items || [];
    const seo = getCategorySeo(params.slug, catName, catDesc);

    const breadcrumb = {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}${path}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: catName, item: `${SITE_URL}${path}` },
      ],
    };

    const collectionPage = {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}${path}#collection`,
      name: seo.title,
      description: seo.description,
      url: `${SITE_URL}${path}`,
      inLanguage: "vi-VN",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
      },
      mainEntity: {
        "@type": "ItemList",
        name: seo.title,
        numberOfItems: items.length,
        itemListElement: items.map((p, i) =>
          buildProductListItem({
            position: i + 1,
            name: p.title,
            slug: p.slug,
            description: (p as any).description || (p as any).short_description,
            thumbnail_url: p.thumbnail_url,
            images: (p as any).images,
            google_drive_link: p.google_drive_link,
            price: p.price,
            categoryName: catName,
          })
        ),
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
