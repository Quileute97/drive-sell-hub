import { Heart, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO, SITE_URL } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import { EmptyState, ErrorState, ProductGridSkeleton } from '@/components/States';
import { RecommendedProducts } from '@/components/RecommendedProducts';

const SELECT = `
  id, slug, title, short_description, price, original_price, thumbnail_url,
  google_drive_link, download_only_link, read_only, download_count, view_count,
  rating_average, rating_count, file_format, file_size,
  categories(name, slug)
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
        .from('products')
        .select(SELECT)
        .in('id', productIds);

      if (cancelled) return;
      if (err) {
        console.error('Error loading wishlist products:', err);
        setError(true);
      } else {
        setProducts((data || []) as unknown as ProductCardData[]);
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
    <div className="min-h-screen">
      <SEO
        title="Sản phẩm yêu thích | Salemylink"
        description="Danh sách sản phẩm digital bạn đã lưu trên Salemylink. Xem lại và mua bất cứ lúc nào."
        url={`${SITE_URL}/wishlist`}
        noindex
      />
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 flex min-w-0 items-center gap-3">
          <Heart className="h-6 w-6 shrink-0 text-destructive" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl lg:text-3xl font-bold">Sản phẩm yêu thích</h1>
            <p className="text-sm text-muted-foreground">
              {busy ? 'Đang tải...' : `${products.length} sản phẩm đã lưu`}
            </p>
          </div>
        </div>

        {!authLoading && !user ? (
          <EmptyState
            icon={Heart}
            title="Đăng nhập để xem danh sách yêu thích"
            description="Lưu lại các sản phẩm bạn quan tâm và xem lại trên mọi thiết bị."
            action={
              <Link to="/auth">
                <Button variant="hero">Đăng nhập</Button>
              </Link>
            }
          />
        ) : busy ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Chưa có sản phẩm nào được lưu"
            description="Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại cho lần sau."
            action={
              <Link to="/">
                <Button variant="hero">Khám phá sản phẩm</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {user && <RecommendedProducts excludeIds={productIds} />}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
