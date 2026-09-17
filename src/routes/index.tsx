import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { buildHead } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeImageUrl, sanitizeImageArray } from "@/lib/productImages";

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

      const cleanProducts = (productsRes.data || []).map((p: any) => ({
        ...p,
        thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
        images: sanitizeImageArray(p.images),
      }));

      const categoriesWithCount = (categoriesRes.data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || "BookOpen",
        product_count: cat.products?.length || 0,
      }));

      return {
        products: cleanProducts,
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
      structuredData: {
        "@type": "FAQPage",
        "@id": "https://salemylink.com/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "Salemylink.com là gì?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Salemylink.com là nền tảng mua bán sản phẩm digital hàng đầu Việt Nam, kết nối người mua và người bán ebook, tài liệu, khóa học online thông qua Google Drive một cách an toàn và hiệu quả.",
            },
          },
          {
            "@type": "Question",
            name: "Làm thế nào để bán sản phẩm trên Salemylink?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Bạn chỉ cần đăng ký tài khoản người bán, upload sản phẩm lên Google Drive, đặt giá và mô tả. Salemylink sẽ xử lý thanh toán và giao hàng tự động cho bạn.",
            },
          },
          {
            "@type": "Question",
            name: "Hoa hồng của Salemylink là bao nhiêu?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Salemylink chỉ thu hoa hồng từ 5% trên mỗi giao dịch thành công - một trong những mức thấp nhất trên thị trường.",
            },
          },
          {
            "@type": "Question",
            name: "Thanh toán trên Salemylink có an toàn không?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Có, Salemylink sử dụng cổng thanh toán PayOS uy tín, hỗ trợ nhiều phương thức thanh toán như thẻ ngân hàng, chuyển khoản, ví điện tử. Mọi giao dịch đều được mã hóa và bảo mật.",
            },
          },
        ],
      },
    }),
  component: IndexRoutePage,
});

function IndexRoutePage() {
  const loaderData = Route.useLoaderData();
  return <Index initialProducts={loaderData?.products} initialCategories={loaderData?.categories} />;
}
