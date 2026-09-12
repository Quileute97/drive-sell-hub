import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { buildHead } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select(`
            *,
            profiles!products_seller_id_fkey(full_name),
            categories(name, slug)
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("categories")
          .select(`
            id,
            name,
            slug,
            icon,
            sort_order,
            products(id)
          `)
          .eq("is_active", true)
          .order("sort_order"),
      ]);

      const categoriesWithCount = (categoriesRes.data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || "BookOpen",
        product_count: cat.products?.length || 0,
      }));

      return {
        products: productsRes.data || [],
        categories: categoriesWithCount,
      };
    } catch {
      return { products: [], categories: [] };
    }
  },
  head: () =>
    buildHead({
      title: "Salemylink - Marketplace Ebook, Tài Liệu Học Tập & Khóa Học Online | Việt Nam",
      description:
        "Marketplace mua bán tài liệu số, ebook, khóa học online qua Google Drive uy tín hàng đầu Việt Nam. Tải xuống tức thì, thanh toán tự động an toàn.",
      path: "/",
      keywords:
        "bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, marketplace digital, mua bán ebook, tài liệu học tập, khóa học trực tuyến",
    }),
  component: IndexRoutePage,
});

function IndexRoutePage() {
  const loaderData = Route.useLoaderData();
  return <Index initialProducts={loaderData?.products} initialCategories={loaderData?.categories} />;
}
