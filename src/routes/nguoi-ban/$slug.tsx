import { createFileRoute } from "@tanstack/react-router";
import SellerProfile from "@/pages/SellerProfile";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { fetchSellerBySlugOrId } from "@/lib/sellerUtils";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { buildProductSchema } from "@/lib/productSchemaBuilder";

export const Route = createFileRoute("/nguoi-ban/$slug")({
  loader: async ({ params }) => {
    try {
      const seller = await fetchSellerBySlugOrId(params.slug);
      if (!seller) return { seller: null, products: [] };

      const { data: products } = await supabase
        .from("products")
        .select("id, title, slug, description, short_description, thumbnail_url, images, google_drive_link, price, original_price, rating_average, rating_count, download_count, created_at, updated_at")
        .eq("seller_id", seller.user_id)
        .eq("status", "active")
        .order("download_count", { ascending: false })
        .limit(10);

      return {
        seller,
        products: products || [],
      };
    } catch {
      return { seller: null, products: [] };
    }
  },
  head: ({ params, loaderData }) => {
    const path = `/nguoi-ban/${params.slug}`;
    const seller = loaderData?.seller;
    const sellerName = seller?.full_name ? fixVietnameseEncoding(seller.full_name) : "Người bán uy tín";
    const products = loaderData?.products || [];

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Người bán", item: `${SITE_URL}/nguoi-ban` },
        { "@type": "ListItem", position: 3, name: sellerName, item: `${SITE_URL}${path}` },
      ],
    };

    const profilePage = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${SITE_URL}${path}`,
      name: `${sellerName} – Gian hàng sản phẩm digital trên Salemylink`,
      description: `Khám phá các sản phẩm digital chất lượng cao từ ${sellerName}. Mua tài liệu, ebook, khóa học uy tín giao nhanh qua Google Drive.`,
      url: `${SITE_URL}${path}`,
      mainEntity: {
        "@type": "Person",
        name: sellerName,
        url: `${SITE_URL}${path}`,
        ...(seller?.avatar_url ? { image: seller.avatar_url } : {}),
      },
    };

    const structuredData: object[] = [breadcrumb, profilePage];

    if (products.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Top sản phẩm nổi bật của ${sellerName}`,
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: buildProductSchema({
            id: p.id,
            slug: p.slug,
            name: p.title,
            description: (p as any).description || (p as any).short_description,
            price: p.price,
            sellerName,
            thumbnail_url: p.thumbnail_url,
            images: (p as any).images,
            google_drive_link: (p as any).google_drive_link,
            ratingValue: p.rating_average,
            ratingCount: p.rating_count,
            createdAt: (p as any).created_at,
          }),
        })),
      });
    }

    return buildHead({
      title: `${sellerName} – Gian hàng người bán`,
      description: `Khám phá các sản phẩm digital, ebook, tài liệu học tập từ ${sellerName} trên Salemylink. Tải ngay sau khi thanh toán.`,
      path,
      image: seller?.avatar_url || undefined,
      keywords: `${sellerName}, gian hàng người bán, tài liệu số, ebook, salemylink`,
      structuredData,
    });
  },
  component: SellerRoutePage,
});

function SellerRoutePage() {
  const loaderData = Route.useLoaderData();
  return <SellerProfile initialSeller={loaderData?.seller} initialProducts={loaderData?.products} />;
}
