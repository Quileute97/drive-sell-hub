import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/States';

const SELECT = `
  id, slug, title, short_description, price, original_price, thumbnail_url,
  google_drive_link, download_only_link, read_only, download_count, view_count,
  rating_average, rating_count, file_format, file_size, category_id,
  categories(name, slug)
`;

interface RecommendedProductsProps {
  /** Loại các sản phẩm này khỏi gợi ý (ví dụ sản phẩm đang xem) */
  excludeIds?: string[];
  limit?: number;
  title?: string;
}

export const RecommendedProducts = ({
  excludeIds = [],
  limit = 4,
  title = 'Gợi ý dành cho bạn',
}: RecommendedProductsProps) => {
  const { user } = useAuth();
  const { productIds: wishlistIds, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistLoading) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const exclude = new Set(excludeIds);
      let seedCategoryIds: string[] = [];

      // Sở thích suy ra từ wishlist + đơn hàng đã mua
      const seedProductIds = [...wishlistIds];
      if (user) {
        const { data: orders } = await supabase
          .from('orders')
          .select('product_id')
          .eq('buyer_id', user.id)
          .limit(50);
        (orders || []).forEach((o) => {
          seedProductIds.push(o.product_id);
          exclude.add(o.product_id);
        });
      }

      if (seedProductIds.length > 0) {
        const { data: seeds } = await supabase
          .from('products')
          .select('category_id')
          .in('id', seedProductIds.slice(0, 50));
        seedCategoryIds = [...new Set((seeds || []).map((s) => s.category_id))];
      }

      let picked: ProductCardData[] = [];

      if (seedCategoryIds.length > 0) {
        const { data } = await supabase
          .from('products')
          .select(SELECT)
          .eq('status', 'active')
          .in('category_id', seedCategoryIds)
          .order('download_count', { ascending: false })
          .limit(limit + exclude.size + 8);
        picked = ((data || []) as unknown as ProductCardData[]).filter(
          (p) => !exclude.has(p.id)
        );
      }

      // Bổ sung bằng sản phẩm phổ biến nếu chưa đủ
      if (picked.length < limit) {
        const have = new Set([...picked.map((p) => p.id), ...exclude]);
        const { data } = await supabase
          .from('products')
          .select(SELECT)
          .eq('status', 'active')
          .order('view_count', { ascending: false })
          .limit(limit + have.size + 8);
        const extra = ((data || []) as unknown as ProductCardData[]).filter(
          (p) => !have.has(p.id)
        );
        picked = [...picked, ...extra];
      }

      if (!cancelled) {
        setProducts(picked.slice(0, limit));
        setLoading(false);
      }
    };

    load().catch((e) => {
      console.error('Error loading recommendations:', e);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wishlistLoading, wishlistIds.join(','), excludeIds.join(','), limit]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="recommended-heading">
      <div className="mb-8 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 id="recommended-heading" className="text-2xl lg:text-3xl font-bold">
          {title}
        </h2>
      </div>

      {loading ? (
        <ProductGridSkeleton count={limit} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
};
