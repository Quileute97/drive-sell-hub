import { Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, SITE_URL } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/States";
import { RecommendedProducts } from "@/components/RecommendedProducts";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";

const SELECT = `
  id, slug, title, short_description, description, price, original_price,
  thumbnail_url, images, google_drive_link, download_only_link, read_only,
  download_count, view_count, rating_average, rating_count,
  file_format, file_size, tags, seller_id,
  profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
  categories(id, name, slug)
`;

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const { productIds, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (wishlistLoading) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);

      if (productIds.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }

      const { data, error: err } = await supabase
        .from("products")
        .select(SELECT)
        .in("id", productIds);

      if (cancelled) return;
      if (err) {
        console.error("Error loading wishlist products:", err);
        setError(true);
      } else {
        setProducts(
          (data || []).map((p: any) => ({
            ...p,
            thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
            images: sanitizeImageArray(p.images),
          })) as ProductCardData[]
        );
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [productIds, wishlistLoading, reloadKey]);

  const busy = authLoading || wishlistLoading || loading;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sản phẩm yêu thích | Salemylink"
        description="Danh sách sản phẩm digital bạn đã lưu trên Salemylink. Xem lại và mua bất cứ lúc nào."
        url={`${SITE_URL}/wishlist`}
        noindex
      />
      <Header />
      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Sản phẩm yêu thích" }]} />

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--tint-danger-bg)] text-accent">
            <Heart className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
              Sản phẩm yêu thích
            </h1>
            <p className="text-sm text-muted-foreground tabular-nums">
              {busy ? "Đang tải..." : `${products.length} tài liệu đã lưu`}
            </p>
          </div>
        </div>

        {!authLoading && !user && products.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Danh sách đang lưu trên trình duyệt này. Đăng nhập để đồng bộ lâu dài trên mọi thiết bị.
            </span>
            <Button size="sm" variant="outline" asChild>
              <Link to="/auth">Đăng nhập đồng bộ</Link>
            </Button>
          </div>
        )}

        {busy ? (
          <ProductGridSkeleton count={6} />
        ) : error ? (
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={!authLoading && !user ? Heart : Search}
            title="Chưa có tài liệu nào được lưu"
            description="Nhấn vào biểu tượng trái tim trên tài liệu để lưu lại xem sau bất cứ lúc nào."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link to="/search">Khám phá tài liệu</Link>
                </Button>
                {!authLoading && !user && (
                  <Button variant="outline" asChild>
                    <Link to="/auth">Đăng nhập</Link>
                  </Button>
                )}
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <RecommendedProducts excludeIds={productIds} />
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
