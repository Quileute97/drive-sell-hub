import { createFileRoute } from "@tanstack/react-router";
import SellerProfile from "@/pages/SellerProfile";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { fetchSellerBySlugOrId } from "@/lib/sellerUtils";
import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { resolveProductImage } from "@/lib/productImages";
import { generateSku } from "@/lib/skuUtils";

export const Route = createFileRoute("/nguoi-ban/$slug")({
  loader: async ({ params }) => {
    try {
      const seller = await fetchSellerBySlugOrId(params.slug);
      if (!seller) return { seller: null, products: [] };

      const { data: products } = await supabase
        .from("products")
        .select("id, title, slug, thumbnail_url, price, original_price, rating_average, rating_count, download_count")
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
        itemListElement: products.map((p, i) => {
          const imgUrl = resolveProductImage(p);
          const productSku = generateSku(p.id, p.slug);
          return {
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: fixVietnameseEncoding(p.title),
              url: `${SITE_URL}/san-pham/${p.slug}`,
              sku: productSku,
              mpn: productSku,
              image: imgUrl,
              brand: {
                "@type": "Brand",
                name: sellerName || "Salemylink.com",
              },
              offers: {
                "@type": "Offer",
                price: String(p.price || 0),
                priceCurrency: "VND",
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                url: `${SITE_URL}/san-pham/${p.slug}`,
                shippingDetails: {
                  "@type": "OfferShippingDetails",
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "VN",
                  },
                  shippingRate: {
                    "@type": "MonetaryAmount",
                    value: "0",
                    currency: "VND",
                  },
                },
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  applicableCountry: "VN",
                  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                  merchantReturnDays: 0,
                  returnMethod: "https://schema.org/ReturnNotPermitted",
                  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
                },
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Math.min(5, Math.max(1, Math.round(Number(p.rating_average || 5) * 10) / 10)),
                reviewCount: Math.max(1, Number(p.rating_count || 1)),
                ratingCount: Math.max(1, Number(p.rating_count || 1)),
                bestRating: 5,
                worstRating: 1,
              },
            },
          };
        }),
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
