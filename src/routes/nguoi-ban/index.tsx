import { createFileRoute } from "@tanstack/react-router";
import Sellers from "@/pages/Sellers";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { getSellerSlug } from "@/lib/sellerUtils";

export const Route = createFileRoute("/nguoi-ban/")({
  loader: async () => {
    try {
      const { data: activeProducts } = await supabase
        .from("products")
        .select(
          "seller_id, rating_average, rating_count, profiles!products_seller_id_fkey(user_id, full_name, avatar_url, created_at, is_verified, total_sales)"
        )
        .eq("status", "active")
        .limit(1000);

      const sellerMap = new Map<
        string,
        {
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string | null;
          is_verified: boolean | null;
          productsCount: number;
          weightedRatingSum: number;
          reviewsCount: number;
          total_sales: number | null;
        }
      >();

      for (const row of activeProducts || []) {
        const sid = (row as any).seller_id as string | null;
        if (!sid) continue;
        const prof = (row as any).profiles;
        const entry = sellerMap.get(sid) || {
          user_id: sid,
          full_name: prof?.full_name || "Người bán",
          avatar_url: prof?.avatar_url || null,
          created_at: prof?.created_at || null,
          is_verified: prof?.is_verified ?? null,
          total_sales: prof?.total_sales ?? null,
          productsCount: 0,
          weightedRatingSum: 0,
          reviewsCount: 0,
        };
        entry.productsCount += 1;
        const rc = Number((row as any).rating_count) || 0;
        const ra = Number((row as any).rating_average) || 0;
        if (rc > 0 && ra > 0) {
          entry.weightedRatingSum += rc * ra;
          entry.reviewsCount += rc;
        }
        sellerMap.set(sid, entry);
      }

      const sellers = Array.from(sellerMap.values())
        .map((s) => ({
          user_id: s.user_id,
          full_name: s.full_name,
          avatar_url: s.avatar_url,
          created_at: s.created_at,
          is_verified: s.is_verified,
          productsCount: s.productsCount,
          avgRating:
            s.reviewsCount > 0 ? s.weightedRatingSum / s.reviewsCount : 0,
          _score:
            (s.is_verified ? 50 : 0) +
            s.reviewsCount * 20 +
            s.productsCount * 3,
        }))
        .sort((a, b) => b._score - a._score)
        .map(({ _score, ...seller }) => seller);

      return { sellers };
    } catch {
      return { sellers: [] };
    }
  },
  head: ({ loaderData }) => {
    const path = "/nguoi-ban";
    const sellers = loaderData?.sellers || [];

    const breadcrumb = {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}${path}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Người bán",
          item: `${SITE_URL}${path}`,
        },
      ],
    };

    const collectionPage = {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}${path}#collection`,
      name: "Danh sách người bán nổi bật – Gian hàng số uy tín",
      description:
        "Khám phá các gian hàng người bán uy tín trên Salemylink: tài liệu học tập, ebook, template và tài nguyên số được xác thực chất lượng.",
      url: `${SITE_URL}${path}`,
      inLanguage: "vi-VN",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
      },
      mainEntity: {
        "@type": "ItemList",
        name: "Người bán nổi bật trên Salemylink",
        numberOfItems: sellers.length,
        itemListElement: sellers.slice(0, 20).map((s: any, idx: number) => {
          const sellerSlug = getSellerSlug({
            full_name: s.full_name,
            user_id: s.user_id,
          });
          return {
            "@type": "ListItem",
            position: idx + 1,
            item: {
              "@type": "Person",
              "@id": `${SITE_URL}/nguoi-ban/${sellerSlug}#seller`,
              name: s.full_name || "Người bán",
              url: `${SITE_URL}/nguoi-ban/${sellerSlug}`,
              ...(s.avatar_url ? { image: s.avatar_url } : {}),
              worksFor: {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: "Salemylink.com",
                url: SITE_URL,
              },
            },
          };
        }),
      },
    };

    return buildHead({
      title: "Danh sách người bán nổi bật – Gian hàng số uy tín",
      description:
        "Khám phá các gian hàng người bán uy tín trên Salemylink: tài liệu học tập, ebook, template và tài nguyên số được xác thực chất lượng.",
      path,
      keywords:
        "người bán salemylink, gian hàng số, seller uy tín, shop tài liệu, mua ebook",
      structuredData: [breadcrumb, collectionPage],
    });
  },
  component: SellersRoutePage,
});

function SellersRoutePage() {
  const loaderData = Route.useLoaderData();
  return <Sellers initialSellers={loaderData?.sellers} />;
}
