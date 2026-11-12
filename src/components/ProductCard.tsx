import { Link } from "@/lib/router-compat";
import { Eye, ShoppingCart, Star, Store } from "lucide-react";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { WishlistButton } from "@/components/WishlistButton";
import { useQuickView } from "@/contexts/QuickViewContext";
import { useCart } from "@/hooks/useCart";
import { isFreeProduct } from "@/lib/productAccess";
import {
  SHORT_LANG_LABELS,
  formatMoneyVnd,
  getShortSummary,
  inferProductLanguage,
} from "@/lib/productQuery";
import { getSellerSlug } from "@/lib/sellerUtils";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  description?: string | null;
  price: number;
  original_price?: number | null;
  thumbnail_url?: string | null;
  images?: string[] | null;
  google_drive_link: string;
  download_only_link?: string | null;
  read_only?: boolean | null;
  download_count?: number | null;
  view_count?: number | null;
  rating_average?: number | null;
  rating_count?: number | null;
  file_format?: string | null;
  file_size?: string | null;
  language?: string | null;
  seller_id?: string | null;
  tags?: string[] | null;
  profiles?: {
    user_id?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    is_verified?: boolean | null;
  } | null;
  categories?: {
    id?: string;
    name: string;
    slug: string;
  } | null;
}

interface ProductCardProps {
  product: ProductCardData;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  hotRank?: number;
  hideSeller?: boolean;
  hideCategory?: boolean;
  className?: string;
}

export const ProductCard = ({
  product,
  loading = "lazy",
  fetchPriority = "auto",
  hotRank,
  hideSeller = false,
  hideCategory = false,
  className,
}: ProductCardProps) => {
  const { openQuickView } = useQuickView();
  const { addToCart } = useCart();

  const isFree = isFreeProduct(product.price);
  const title = fixVietnameseEncoding(product.title);
  const summary = getShortSummary(product.short_description, product.description, 150);
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  const formatLabel = (product.file_format || "PDF").toUpperCase();
  const langCode = inferProductLanguage(product);
  const langLabel = SHORT_LANG_LABELS[langCode] || "Tiếng Việt";
  const sellerName = fixVietnameseEncoding(product.profiles?.full_name || "Người bán");
  const sellerId = product.profiles?.user_id || product.seller_id || "";
  const sellerHref = sellerId
    ? `/nguoi-ban/${getSellerSlug({ full_name: sellerName, user_id: sellerId })}`
    : "/nguoi-ban";

  return (
    <article
      className={cn(
        "group relative flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface transition-colors hover:border-[var(--border-strong)]",
        className
      )}
    >
      {/* Thumbnail 4:3 */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-muted">
        <Link to={`/san-pham/${product.slug}`} className="block h-full w-full">
          <div className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]">
            <ProductThumbnail
              googleDriveLink={product.google_drive_link}
              thumbnailUrl={product.thumbnail_url ?? null}
              fileFormat={product.file_format ?? ""}
              title={`${title}${product.categories ? ` - ${product.categories.name}` : ""}`}
              size={600}
              loading={loading}
              fetchPriority={fetchPriority}
              allowIframePreview={false}
            />
          </div>
        </Link>

        {discount > 0 ? (
          <span className="pointer-events-none absolute left-3 sm:left-4 top-3 inline-flex h-6 items-center rounded-full bg-[var(--tint-danger-bg)] px-2 text-xs font-semibold text-[var(--status-danger)] ring-1 ring-border">
            -{discount}%
          </span>
        ) : hotRank ? (
          <span className="pointer-events-none absolute left-3 sm:left-4 top-3 inline-flex h-6 items-center rounded-full bg-[var(--tint-warning-bg)] px-2 text-xs font-semibold text-[var(--status-warning)] ring-1 ring-border">
            #{hotRank} Hot
          </span>
        ) : product.read_only ? (
          <span className="pointer-events-none absolute left-3 sm:left-4 top-3 inline-flex h-6 items-center rounded-full bg-[var(--tint-success-bg)] px-2 text-xs font-medium text-[var(--status-success)] ring-1 ring-border">
            Đọc online
          </span>
        ) : null}

        <WishlistButton productId={product.id} variant="floating" />

        {/* Desktop hover spec preview strip (Req 3.4) */}
        <div className="invisible pointer-events-none absolute inset-x-0 bottom-0 hidden border-t border-border bg-surface px-3 py-1.5 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100 lg:block sm:px-4">
          <p className="truncate text-xs font-medium text-foreground">
            {formatLabel}
            {product.file_size ? ` · ${product.file_size}` : ""} · {langLabel}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        {!hideCategory && (product.categories || product.file_format) && (
          <div className="mb-2 flex items-center gap-1.5 overflow-hidden">
            {product.categories && (
              <span className="inline-flex h-6 max-w-full items-center truncate rounded-full bg-secondary px-2.5 text-xs font-medium text-foreground">
                <span className="truncate">{product.categories.name}</span>
              </span>
            )}
            {product.file_format && (
              <span className="hidden h-6 shrink-0 items-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground sm:inline-flex">
                {formatLabel}
              </span>
            )}
          </div>
        )}

        <h3 className="line-clamp-2 min-h-[2.5rem] min-w-0 break-words [overflow-wrap:anywhere] text-sm font-medium leading-5 text-pretty text-foreground transition-colors group-hover:text-primary sm:text-[15px] sm:leading-5">
          <Link to={`/san-pham/${product.slug}`} className="inline focus-visible:underline">
            {title}
          </Link>
        </h3>

        {/* Short description <= 150 chars, omitted entirely if empty (Req 3.2) */}
        {summary.length > 0 && (
          <p className="mt-2 line-clamp-3 break-words [overflow-wrap:anywhere] text-[13px] leading-5 text-pretty text-muted-foreground">
            {summary}
          </p>
        )}

        {/* Rating */}
        {(product.rating_count ?? 0) > 0 ? (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 shrink-0 fill-[var(--status-star)] text-[var(--status-star)]" />
            <span className="font-semibold text-foreground tabular-nums">
              {Number(product.rating_average || 0).toFixed(1)}
            </span>
            <span className="truncate text-muted-foreground tabular-nums">
              ({product.rating_count} đánh giá)
            </span>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Chưa có đánh giá</p>
        )}

        {/* Seller row (Req 3.6) */}
        {!hideSeller && (product.profiles?.full_name || product.seller_id) && (
          <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <Link
              to={sellerHref}
              className="inline-flex min-h-8 min-w-0 flex-1 items-center gap-1.5 font-medium text-foreground hover:text-primary hover:underline"
            >
              <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{sellerName}</span>
            </Link>
            {(product.download_count ?? 0) > 0 && (
              <span className="hidden shrink-0 tabular-nums sm:inline">
                {product.download_count} tải
              </span>
            )}
          </div>
        )}

        {/* Bottom bar: Price + Actions (touch-friendly & responsive down to 320px) */}
        <div className="mt-auto space-y-2 border-t border-border pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="whitespace-nowrap text-[15px] font-bold text-primary tabular-nums">
                {isFree ? "Miễn phí" : formatMoneyVnd(product.price)}
              </span>
              {discount > 0 && product.original_price && (
                <span className="whitespace-nowrap text-xs text-muted-foreground line-through tabular-nums">
                  {formatMoneyVnd(product.original_price)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isFree && !product.read_only && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(product.id);
                }}
                aria-label={`Thêm ${title} vào giỏ hàng`}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover sm:min-h-10 sm:px-3"
              >
                <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden min-[375px]:inline truncate">Thêm giỏ</span>
                <span className="min-[375px]:hidden">Thêm</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openQuickView(product);
              }}
              aria-haspopup="dialog"
              aria-label={`Xem nhanh ${title}`}
              className={cn(
                "inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-surface px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-button-hover sm:min-h-10",
                isFree || product.read_only ? "w-full" : "w-12 sm:w-auto sm:px-3"
              )}
            >
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span className={isFree || product.read_only ? "inline" : "sr-only sm:not-sr-only"}>
                {isFree && !product.read_only ? "Xem & tải nhanh" : "Xem nhanh"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
