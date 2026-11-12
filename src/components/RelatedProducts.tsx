import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { formatMoneyVnd } from "@/lib/productQuery";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
  categorySlug?: string | undefined;
  variant?: "section" | "sidebar" | undefined;
  limit?: number | undefined;
}

const RELATED_SELECT = `
  id, slug, title, short_description, description, price, original_price,
  thumbnail_url, images, google_drive_link, download_only_link, read_only,
  download_count, view_count, rating_average, rating_count,
  file_format, file_size, tags, seller_id,
  profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
  categories(id, name, slug)
`;

export const RelatedProducts = ({
  categoryId,
  currentProductId,
  categorySlug,
  variant = "section",
  limit = 3,
}: RelatedProductsProps) => {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchRelated = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select(RELATED_SELECT)
          .eq("status", "active")
          .eq("category_id", categoryId)
          .neq("id", currentProductId)
          .order("download_count", { ascending: false })
          .limit(limit);

        if (error) throw error;
        if (cancelled) return;

        const cleaned = (data || []).map((p: any) => ({
          ...p,
          thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
          images: sanitizeImageArray(p.images),
        }));
        setProducts(cleaned);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [categoryId, currentProductId, limit]);

  if (loading || products.length === 0) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <section
        aria-labelledby="sidebar-related-heading"
        className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-2.5">
          <h2
            id="sidebar-related-heading"
            className="text-sm font-semibold text-foreground"
          >
            Sản phẩm liên quan ({products.length})
          </h2>
          {categorySlug && (
            <Link
              to={`/danh-muc/${categorySlug}`}
              className="inline-flex min-h-11 sm:min-h-8 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>Xem thêm</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="space-y-2.5">
          {products.map((p) => {
            const ratingAvg =
              p.rating_count && p.rating_count > 0
                ? Number(p.rating_average || 5).toFixed(1)
                : null;
            return (
              <Link
                key={p.id}
                to={`/san-pham/${p.slug}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="group flex min-h-12 items-start gap-3 rounded-xl p-2 hover:bg-button-hover transition-colors"
              >
                <div className="w-16 aspect-4/3 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <ProductThumbnail
                    thumbnailUrl={p.thumbnail_url}
                    googleDriveLink={p.google_drive_link}
                    fileFormat={p.file_format}
                    title={p.title}
                    size={240}
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-pretty text-foreground group-hover:text-primary transition-colors">
                    {fixVietnameseEncoding(p.title)}
                  </h3>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {formatMoneyVnd(p.price)}
                    </span>
                    {ratingAvg && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
                        <Star className="h-3 w-3 fill-[var(--status-star)] text-[var(--status-star)]" />
                        <span>{ratingAvg}</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10" aria-labelledby="related-products-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2
          id="related-products-heading"
          className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
        >
          Sản phẩm cùng danh mục
        </h2>
        {categorySlug && (
          <Link
            to={`/danh-muc/${categorySlug}`}
            className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
