import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/States";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";

const SELECT = `
  id, slug, title, short_description, description, price, original_price,
  thumbnail_url, images, google_drive_link, download_only_link, read_only,
  download_count, view_count, rating_average, rating_count,
  file_format, file_size, tags, seller_id, category_id,
  profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
  categories(id, name, slug)
`;

interface RecommendedProductsProps {
  /** Loại các sản phẩm này khỏi gợi ý (ví dụ sản phẩm đang xem) */
  excludeIds?: string[];
  categoryId?: string;
  limit?: number;
  title?: string;
  initialProducts?: ProductCardData[];
}

export const RecommendedProducts = ({
  excludeIds = [],
  categoryId,
  limit = 3,
  title = "Sản phẩm bạn có thể thích",
  initialProducts,
}: RecommendedProductsProps) => {
  const { user } = useAuth();
  const { productIds: wishlistIds, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<ProductCardData[]>(
    initialProducts || []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlistLoading) return;
    let cancelled = false;

    const load = async () => {
      if (products.length === 0) setLoading(true);
      const exclude = new Set(excludeIds);
      const seedCategoryIds = new Set<string>();
      if (categoryId) seedCategoryIds.add(categoryId);

      // Sở thích suy ra từ wishlist + đơn hàng đã mua
      const seedProductIds = [...wishlistIds];
      if (user) {
        const { data: orders } = await supabase
          .from("orders")
          .select("product_id")
          .eq("buyer_id", user.id)
          .limit(50);
        (orders || []).forEach((o) => {
          seedProductIds.push(o.product_id);
          exclude.add(o.product_id);
        });
      }

      if (seedProductIds.length > 0) {
        const { data: seeds } = await supabase
          .from("products")
          .select("category_id")
          .in("id", seedProductIds.slice(0, 50));
        (seeds || []).forEach((s) => {
          if (s.category_id) seedCategoryIds.add(s.category_id);
        });
      }

      let picked: ProductCardData[] = [];
      const catList = Array.from(seedCategoryIds);

      if (catList.length > 0) {
        const { data } = await supabase
          .from("products")
          .select(SELECT)
          .eq("status", "active")
          .in("category_id", catList)
          .order("download_count", { ascending: false })
          .limit(limit + exclude.size + 6);
        picked = ((data || []) as unknown as ProductCardData[]).filter(
          (p) => !exclude.has(p.id)
        );
      }

      // Bổ sung bằng sản phẩm phổ biến nếu chưa đủ
      if (picked.length < limit) {
        const have = new Set([...picked.map((p) => p.id), ...exclude]);
        const { data } = await supabase
          .from("products")
          .select(SELECT)
          .eq("status", "active")
          .order("view_count", { ascending: false })
          .limit(limit + have.size + 6);
        const extra = ((data || []) as unknown as ProductCardData[]).filter(
          (p) => !have.has(p.id)
        );
        picked = [...picked, ...extra];
      }

      const sanitized = picked.slice(0, limit).map((p: any) => ({
        ...p,
        thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
        images: sanitizeImageArray(p.images),
      }));

      if (!cancelled) {
        setProducts(sanitized);
        setLoading(false);
      }
    };

    load().catch((e) => {
      console.error("Error loading recommendations:", e);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    wishlistLoading,
    wishlistIds.join(","),
    excludeIds.join(","),
    categoryId,
    limit,
  ]);

  if (!loading && products.length === 0)
    return null;

  return (
    <section className="mt-10" aria-labelledby="recommended-heading">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2
          id="recommended-heading"
          className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
        >
          {title}
        </h2>
      </div>

      {loading ? (
        <ProductGridSkeleton count={limit} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
};
