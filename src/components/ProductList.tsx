import { useEffect, useState } from "react";
import { ArrowRight, Flame, Sparkles, Store } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { SellerCard, type SellerCardData } from "@/components/SellerCard";
import { EmptyState, ProductGridSkeleton } from "@/components/States";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";

interface ProductListProps {
  initialProducts?: ProductCardData[] | undefined;
  initialHotProducts?: ProductCardData[] | undefined;
  initialTopSellers?: SellerCardData[] | undefined;
}

const CLIENT_PRODUCT_SELECT = `
  id, slug, title, short_description, description, price, original_price,
  thumbnail_url, images, google_drive_link, download_only_link, read_only,
  download_count, view_count, rating_average, rating_count, seller_id,
  category_id, file_format, file_size, tags, created_at,
  profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
  categories(id, name, slug)
`;

export const ProductList = ({
  initialProducts,
  initialHotProducts,
  initialTopSellers,
}: ProductListProps) => {
  const [latestProducts, setLatestProducts] = useState<ProductCardData[]>(
    initialProducts || []
  );
  const [hotProducts, setHotProducts] = useState<ProductCardData[]>(
    initialHotProducts || []
  );
  const [topSellers, setTopSellers] = useState<SellerCardData[]>(
    initialTopSellers || []
  );
  const [loading, setLoading] = useState(
    !(initialProducts && initialProducts.length > 0)
  );

  useEffect(() => {
    if (
      initialProducts &&
      initialProducts.length > 0 &&
      initialHotProducts &&
      initialHotProducts.length > 0
    ) {
      setLatestProducts(initialProducts);
      setHotProducts(initialHotProducts);
      if (initialTopSellers) setTopSellers(initialTopSellers);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchDiscovery = async () => {
      try {
        const [latestRes, hotRes, sellerMetricsRes] = await Promise.all([
          supabase
            .from("products")
            .select(CLIENT_PRODUCT_SELECT)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("products")
            .select(CLIENT_PRODUCT_SELECT)
            .eq("status", "active")
            .order("download_count", { ascending: false })
            .limit(6),
          supabase
            .from("products")
            .select(
              "seller_id, download_count, rating_average, rating_count, profiles!products_seller_id_fkey(user_id, full_name, avatar_url, created_at, is_verified)"
            )
            .eq("status", "active")
            .limit(500),
        ]);

        if (cancelled) return;

        const clean = (rows: any[]) =>
          rows.map((p) => ({
            ...p,
            thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
            images: sanitizeImageArray(p.images),
          }));

        setLatestProducts(clean(latestRes.data || []));
        setHotProducts(clean(hotRes.data || []));

        const sellerMap = new Map<
          string,
          {
            user_id: string;
            full_name: string | null;
            avatar_url: string | null;
            created_at: string | null;
            is_verified: boolean | null;
            productsCount: number;
            weightedSum: number;
            reviewsCount: number;
          }
        >();

        for (const row of sellerMetricsRes.data || []) {
          const sid = (row as any).seller_id as string | null;
          if (!sid) continue;
          const prof = (row as any).profiles;
          const item = sellerMap.get(sid) || {
            user_id: sid,
            full_name: prof?.full_name || "Người bán",
            avatar_url: prof?.avatar_url || null,
            created_at: prof?.created_at || null,
            is_verified: prof?.is_verified ?? null,
            productsCount: 0,
            weightedSum: 0,
            reviewsCount: 0,
          };
          item.productsCount += 1;
          const rc = Number((row as any).rating_count) || 0;
          const ra = Number((row as any).rating_average) || 0;
          if (rc > 0 && ra > 0) {
            item.weightedSum += ra * rc;
            item.reviewsCount += rc;
          }
          sellerMap.set(sid, item);
        }

        const rankedSellers: SellerCardData[] = Array.from(sellerMap.values())
          .sort(
            (a, b) =>
              b.reviewsCount * 20 +
              b.productsCount * 3 -
              (a.reviewsCount * 20 + a.productsCount * 3)
          )
          .slice(0, 6)
          .map((s) => ({
            user_id: s.user_id,
            full_name: s.full_name,
            avatar_url: s.avatar_url,
            created_at: s.created_at,
            is_verified: s.is_verified,
            productsCount: s.productsCount,
            avgRating: s.reviewsCount > 0 ? s.weightedSum / s.reviewsCount : 0,
          }));

        setTopSellers(rankedSellers);
      } catch (error) {
        console.error("Error fetching discovery products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDiscovery();
    return () => {
      cancelled = true;
    };
  }, [initialProducts, initialHotProducts, initialTopSellers]);

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      {/* 1. SẢN PHẨM MỚI */}
      <section aria-labelledby="latest-products-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Mới cập nhật</span>
            </div>
            <h2
              id="latest-products-heading"
              className="mt-0.5 text-xl font-bold tracking-tight text-balance text-foreground sm:text-2xl"
            >
              Sản phẩm mới
            </h2>
          </div>
          <Link
            to="/search?sort=newest"
            className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : latestProducts.length === 0 ? (
          <EmptyState title="Chưa có sản phẩm mới nào" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {latestProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={index < 3 ? "eager" : "lazy"}
                fetchPriority={index < 2 ? "high" : "auto"}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. HOT TUẦN NÀY */}
      {(loading || hotProducts.length > 0) && (
        <section aria-labelledby="hot-products-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                <Flame className="h-3.5 w-3.5" />
                <span>Tải nhiều nhất</span>
              </div>
              <h2
                id="hot-products-heading"
                className="mt-0.5 text-xl font-bold tracking-tight text-balance text-foreground sm:text-2xl"
              >
                Hot tuần này
              </h2>
            </div>
            <Link
              to="/search?sort=popular"
              className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
            >
              <span>Xem bảng xếp hạng</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
              {hotProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  hotRank={index + 1}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. NGƯỜI BÁN NỔI BẬT */}
      {topSellers.length > 0 && (
        <section aria-labelledby="featured-sellers-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Store className="h-3.5 w-3.5" />
                <span>Tác giả &amp; Shop uy tín</span>
              </div>
              <h2
                id="featured-sellers-heading"
                className="mt-0.5 text-xl font-bold tracking-tight text-balance text-foreground sm:text-2xl"
              >
                Người bán nổi bật
              </h2>
            </div>
            <Link
              to="/nguoi-ban"
              className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
            >
              <span>Tất cả người bán</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topSellers.map((seller) => (
              <SellerCard key={seller.user_id} seller={seller} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
