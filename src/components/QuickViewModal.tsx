import { ArrowRight, BookOpen, Download, Eye, ShoppingCart, Star, Store } from "lucide-react";
import { Link, useNavigate } from "@/lib/router-compat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { FreeDownloadButton } from "@/components/FreeDownloadButton";
import { WishlistButton } from "@/components/WishlistButton";
import { useQuickView } from "@/contexts/QuickViewContext";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { getProductDownloadUrl, isFreeProduct } from "@/lib/productAccess";
import {
  SHORT_LANG_LABELS,
  formatMoneyVnd,
  getShortSummary,
  inferProductLanguage,
} from "@/lib/productQuery";
import { getSellerSlug } from "@/lib/sellerUtils";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

export function QuickViewModal() {
  const { product, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!product) return null;

  const title = fixVietnameseEncoding(product.title);
  const summary =
    getShortSummary(product.short_description, product.description, 220) ||
    "Tài liệu số định dạng chuẩn, hỗ trợ xem trước và tải ngay qua Google Drive.";
  const isFree = isFreeProduct(product.price);
  const downloadUrl = getProductDownloadUrl(
    product.google_drive_link,
    product.download_only_link
  );
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;
  const sellerName = fixVietnameseEncoding(product.profiles?.full_name || "Người bán");
  const sellerId = product.profiles?.user_id || product.seller_id || "";
  const sellerHref = sellerId
    ? `/nguoi-ban/${getSellerSlug({ full_name: sellerName, user_id: sellerId })}`
    : "/nguoi-ban";
  const langCode = inferProductLanguage(product);
  const langLabel = SHORT_LANG_LABELS[langCode] || "Tiếng Việt";

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && closeQuickView()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-h-[92dvh] max-w-2xl overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 gap-3 sm:gap-5">
        <DialogHeader className="min-w-0 pr-8 text-left space-y-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {product.categories && (
              <Badge variant="secondary" className="text-xs font-medium">
                {product.categories.name}
              </Badge>
            )}
            {product.file_format && (
              <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">
                {product.file_format.toUpperCase()}
                {product.file_size ? ` · ${product.file_size}` : ""}
              </span>
            )}
            <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">
              {langLabel}
            </span>
          </div>
          <DialogTitle className="text-base font-bold leading-snug text-balance break-words [overflow-wrap:anywhere] sm:text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Xem nhanh thông tin tài liệu {title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-w-0 gap-3 sm:gap-5 sm:grid-cols-12">
          <div className="relative aspect-[16/9] sm:aspect-[4/3] min-w-0 overflow-hidden rounded-xl border border-border bg-muted sm:col-span-5">
            <ProductThumbnail
              googleDriveLink={product.google_drive_link}
              thumbnailUrl={product.thumbnail_url ?? null}
              fileFormat={product.file_format ?? ""}
              title={title}
              size={600}
              loading="eager"
              allowIframePreview={false}
            />
            {discount > 0 && (
              <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex h-6 items-center rounded-full bg-[var(--tint-danger-bg)] px-2 text-xs font-semibold text-[var(--status-danger)] ring-1 ring-border">
                -{discount}%
              </span>
            )}
            <WishlistButton productId={product.id} />
          </div>

          <div className="flex min-w-0 flex-col justify-between gap-2.5 sm:gap-4 sm:col-span-7">
            <div className="min-w-0 space-y-2 sm:space-y-3">
              <p className="line-clamp-3 sm:line-clamp-none break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-pretty text-muted-foreground">
                {summary}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {(product.rating_count ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Star className="h-3.5 w-3.5 fill-[var(--status-star)] text-[var(--status-star)]" />
                    <span className="tabular-nums">
                      {Number(product.rating_average || 0).toFixed(1)} ({product.rating_count} đánh giá)
                    </span>
                  </span>
                ) : (
                  <span>Chưa có đánh giá</span>
                )}
                {(product.download_count ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Download className="h-3.5 w-3.5" />
                    {product.download_count} lượt tải
                  </span>
                )}
                {(product.view_count ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Eye className="h-3.5 w-3.5" />
                    {product.view_count} lượt xem
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5 text-xs">
                <Link
                  to={sellerHref}
                  onClick={closeQuickView}
                  className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary hover:underline"
                >
                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{sellerName}</span>
                </Link>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 border-t border-border pt-2.5 sm:pt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {isFree ? "Miễn phí" : formatMoneyVnd(product.price)}
                </span>
                {discount > 0 && product.original_price && (
                  <span className="text-sm text-muted-foreground line-through tabular-nums">
                    {formatMoneyVnd(product.original_price)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {product.read_only ? (
                  <Button
                    className="w-full min-h-12"
                    onClick={() => {
                      closeQuickView();
                      navigate(`/read/${product.slug}`);
                    }}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Đọc trực tuyến</span>
                  </Button>
                ) : isFree ? (
                  <FreeDownloadButton
                    downloadUrl={downloadUrl}
                    className="min-h-12"
                    onMissingUrl={() => {
                      toast({
                        title: "Thiếu link tải",
                        description: "Tài liệu miễn phí này hiện chưa có link tải hợp lệ.",
                        variant: "destructive",
                      });
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="min-h-12"
                      onClick={() => addToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Thêm giỏ</span>
                    </Button>
                    <Button
                      className="min-h-12"
                      onClick={() => {
                        addToCart(product.id);
                        closeQuickView();
                        navigate("/cart");
                      }}
                    >
                      Mua ngay
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full min-h-11"
                  asChild
                  onClick={closeQuickView}
                >
                  <Link to={`/san-pham/${product.slug}`}>
                    <span>Xem trang chi tiết</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

