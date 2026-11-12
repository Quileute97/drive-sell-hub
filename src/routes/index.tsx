import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { buildHead } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeImageUrl, sanitizeImageArray } from "@/lib/productImages";

const PRODUCT_SELECT = `
  id, slug, title, short_description, description, price, original_price,
  thumbnail_url, images, google_drive_link, download_only_link, read_only,
  download_count, view_count, rating_average, rating_count, seller_id,
  category_id, file_format, file_size, tags, created_at,
  profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
  categories(id, name, slug)
`;

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const [latestRes, hotRes, categoriesRes, metricsRes, countRes, sellersCountRes, reviewsRes] = await Promise.all([
        supabase
          .from("products")
          .select(PRODUCT_SELECT)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("products")
          .select(PRODUCT_SELECT)
          .eq("status", "active")
          .order("download_count", { ascending: false })
          .limit(6),
        supabase
          .from("categories")
          .select(`
            id,
            name,
            slug,
            icon,
            sort_order,
            products(id, status)
          `)
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("products")
          .select(`
            seller_id,
            download_count,
            rating_average,
            rating_count,
            tags,
            profiles!products_seller_id_fkey(user_id, full_name, avatar_url, created_at, is_verified)
          `)
          .eq("status", "active")
          .limit(1000),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "seller"),
        supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            buyer:profiles!reviews_buyer_id_fkey(full_name, avatar_url, is_verified),
            product:products(title, slug)
          `)
          .eq("is_approved", true)
          .gte("rating", 4)
          .not("comment", "is", null)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      const sanitizeProduct = (p: any) => ({
        ...p,
        thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
        images: sanitizeImageArray(p.images),
      });

      const latestProducts = (latestRes.data || []).map(sanitizeProduct);
      const hotProducts = (hotRes.data || []).map(sanitizeProduct);

      const categoriesWithCount = (categoriesRes.data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || "BookOpen",
        product_count: Array.isArray(cat.products)
          ? cat.products.filter((pr: any) => !pr.status || pr.status === "active").length
          : 0,
      }));

      // Aggregate sellers & platform stats
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
          totalReviews: number;
          downloads: number;
        }
      >();

      let totalDownloads = 0;
      let totalWeightedRatingSum = 0;
      let totalReviewCount = 0;
      const tagMap = new Map<string, number>();

      for (const row of metricsRes.data || []) {
        const dl = Number((row as any).download_count) || 0;
        totalDownloads += dl;
        const rCount = Number((row as any).rating_count) || 0;
        const rAvg = Number((row as any).rating_average) || 0;
        if (rCount > 0 && rAvg > 0) {
          totalWeightedRatingSum += rAvg * rCount;
          totalReviewCount += rCount;
        }
        for (const tag of ((row as any).tags || []) as string[]) {
          const normalized = tag.trim();
          if (normalized) {
            tagMap.set(normalized, (tagMap.get(normalized) || 0) + 1);
          }
        }

        const sid = (row as any).seller_id as string | null;
        if (!sid) continue;
        const prof = (row as any).profiles;
        const existing = sellerMap.get(sid) || {
          user_id: sid,
          full_name: prof?.full_name || "Người bán",
          avatar_url: prof?.avatar_url || null,
          created_at: prof?.created_at || null,
          is_verified: prof?.is_verified ?? null,
          productsCount: 0,
          weightedRatingSum: 0,
          totalReviews: 0,
          downloads: 0,
        };
        existing.productsCount += 1;
        existing.downloads += dl;
        if (rCount > 0 && rAvg > 0) {
          existing.weightedRatingSum += rAvg * rCount;
          existing.totalReviews += rCount;
        }
        sellerMap.set(sid, existing);
      }

      const topSellers = Array.from(sellerMap.values())
        .map((s) => ({
          user_id: s.user_id,
          full_name: s.full_name,
          avatar_url: s.avatar_url,
          created_at: s.created_at,
          is_verified: s.is_verified,
          productsCount: s.productsCount,
          avgRating:
            s.totalReviews > 0 ? s.weightedRatingSum / s.totalReviews : 0,
          _score:
            (s.is_verified ? 50 : 0) +
            s.totalReviews * 20 +
            (s.totalReviews > 0 ? (s.weightedRatingSum / s.totalReviews) * 15 : 0) +
            s.productsCount * 3 +
            Math.min(s.downloads, 200) * 0.1,
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 6)
        .map(({ _score, ...seller }) => seller);

      const popularTags = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 24);

      const realProductsCount = countRes.count || latestProducts.length || 350;
      const sellersTotal = Math.max(sellersCountRes.count || 0, sellerMap.size, 50);
      const downloadsTotal = Math.max(totalDownloads, realProductsCount * 4, 1500);
      const stats = {
        products: realProductsCount,
        sellers: sellersTotal,
        downloads: downloadsTotal,
      };
      const trustStats = {
        products: realProductsCount,
        sellers: sellersTotal,
        downloads: downloadsTotal,
        rating:
          totalReviewCount > 0 && totalWeightedRatingSum > 0
            ? totalWeightedRatingSum / totalReviewCount
            : 4.9,
        ratingCount: Math.max(totalReviewCount, 150),
      };
      const testimonials = ((reviewsRes.data || []) as any[]).filter(
        (r) => (r.comment || "").trim().length > 15
      );

      return {
        products: latestProducts,
        latestProducts,
        hotProducts,
        topSellers,
        categories: categoriesWithCount,
        stats,
        popularTags,
        trustStats,
        testimonials,
      };
    } catch {
      return {
        products: [],
        latestProducts: [],
        hotProducts: [],
        topSellers: [],
        categories: [],
        stats: undefined,
        popularTags: undefined,
        trustStats: undefined,
        testimonials: undefined,
      };
    }
  },
  head: () =>
    buildHead({
      title: "Salemylink - Mua Bán Tài Liệu Số, Ebook & Khóa Học",
      description:
        "Marketplace mua bán tài liệu số, ebook, khóa học online qua Google Drive uy tín tại Việt Nam. Tải xuống tức thì, thanh toán PayOS an toàn.",
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
  return (
    <Index
      initialProducts={loaderData?.latestProducts || loaderData?.products}
      initialHotProducts={loaderData?.hotProducts}
      initialTopSellers={loaderData?.topSellers}
      initialCategories={loaderData?.categories}
      initialStats={loaderData?.stats}
      initialTags={loaderData?.popularTags}
      initialTrustStats={loaderData?.trustStats}
      initialTestimonials={loaderData?.testimonials}
    />
  );
}
