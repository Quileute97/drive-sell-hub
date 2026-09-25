import { createFileRoute } from "@tanstack/react-router";
import Sellers from "@/pages/Sellers";
import { buildHead, SITE_URL } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/nguoi-ban/")({
  loader: async () => {
    try {
      const { data: sellers } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, created_at, total_sales, is_verified")
        .eq("role", "seller")
        .order("total_sales", { ascending: false })
        .limit(20);

      return { sellers: sellers || [] };
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
        { "@type": "ListItem", position: 2, name: "Người bán", item: `${SITE_URL}${path}` },
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
        itemListElement: sellers.map((s: any, idx: number) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Person",
            "@id": `${SITE_URL}/nguoi-ban/${s.user_id}#seller`,
            name: s.full_name || "Người bán",
            url: `${SITE_URL}/nguoi-ban/${s.user_id}`,
            ...(s.avatar_url ? { image: s.avatar_url } : {}),
            worksFor: {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Salemylink.com",
              url: SITE_URL,
            },
          },
        })),
      },
    };

    return buildHead({
      title: "Danh sách người bán nổi bật – Gian hàng số uy tín",
      description:
        "Khám phá các gian hàng người bán uy tín trên Salemylink: tài liệu học tập, ebook, template và tài nguyên số được xác thực chất lượng.",
      path,
      keywords: "người bán salemylink, gian hàng số, seller uy tín, shop tài liệu, mua ebook",
      structuredData: [breadcrumb, collectionPage],
    });
  },
  component: Sellers,
});
