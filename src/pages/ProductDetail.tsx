import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
  Pencil,
  ShoppingCart,
  Star,
  Store,
  Sun,
  Type,
  X,
} from "lucide-react";
import DOMPurify from "dompurify";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RelatedProducts } from "@/components/RelatedProducts";
import { RecommendedProducts } from "@/components/RecommendedProducts";
import { ProductReviews, type ProductReview } from "@/components/ProductReviews";
import EditProductForm from "@/components/EditProductForm";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductFAQ } from "@/components/ProductFAQ";
import { RelatedCategories } from "@/components/RelatedCategories";
import { FreeDownloadButton } from "@/components/FreeDownloadButton";
import { WishlistButton } from "@/components/WishlistButton";
import { FollowButton } from "@/components/FollowButton";
import { ShareButtons } from "@/components/ShareButtons";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ErrorState } from "@/components/States";
import { TableOfContents } from "@/components/TableOfContents";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate, useParams } from "@/lib/router-compat";
import {
  getGoogleDrivePreviewUrl,
  getProductDownloadUrl,
  isFreeProduct,
} from "@/lib/productAccess";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";
import {
  SHORT_LANG_LABELS,
  formatMoneyVnd,
  inferProductLanguage,
} from "@/lib/productQuery";
import { getSellerSlug } from "@/lib/sellerUtils";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

// Sanitize seller-provided HTML. Allow common rich-text + trusted iframes only.
const sanitizeProductHtml = (html: string) => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "");
  }
  DOMPurify.removeAllHooks();
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe") {
      const src = (node as HTMLIFrameElement).getAttribute("src") || "";
      const allowed =
        /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be|drive\.google\.com|docs\.google\.com|player\.vimeo\.com)\//i;
      if (!allowed.test(src)) {
        node.parentNode?.removeChild(node);
      }
    }
  });
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "target",
      "id",
      "class",
    ],
    FORBID_TAGS: [
      "script",
      "style",
      "object",
      "embed",
      "form",
      "input",
      "button",
    ],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
    ],
  });
};

interface ProductDetailData {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number;
  thumbnail_url: string;
  images: string[];
  download_count: number;
  view_count: number;
  rating_average: number;
  rating_count: number;
  file_size: string;
  file_format: string;
  language?: string | null;
  tags: string[];
  seller_id: string;
  category_id: string;
  google_drive_link: string;
  download_only_link: string | null;
  read_only: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  profiles?: {
    user_id?: string | null;
    full_name: string | null;
    avatar_url: string | null;
    is_verified?: boolean | null;
  } | null;
  categories?: {
    id?: string;
    name: string;
    slug: string;
  } | null;
}

export default function ProductDetail({
  initialProduct,
}: {
  initialProduct?: ProductDetailData | any;
}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<ProductDetailData | null>(
    initialProduct || null
  );
  const [reviews, setReviews] = useState<ProductReview[]>(
    initialProduct?.reviews || []
  );
  const [loading, setLoading] = useState(!initialProduct);
  const [isEditing, setIsEditing] = useState(false);

  // Reading mode controls
  const [readingMode, setReadingMode] = useState(false);
  const [readingPaper, setReadingPaper] = useState<"white" | "sepia">("white");
  const [readingFontSize, setReadingFontSize] = useState<"sm" | "base" | "lg">(
    "base"
  );
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  // Seller aggregated stats for the sticky seller block
  const [sellerStats, setSellerStats] = useState<{
    productsCount: number;
    avgRating: number;
  } | null>(null);

  const { toast } = useToast();
  const { addToCart } = useCart();

  const isOwner = Boolean(
    user &&
    product &&
    (user.id === product.seller_id || (user as any).role === "admin")
  );

  useEffect(() => {
    if (slug) {
      fetchProduct();
    } else if (!initialProduct) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProduct = async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      const cleanSlug = decodeURIComponent(slug).trim().replace(/\/$/, "");
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          cleanSlug
        );

      let query = supabase.from("products").select(`
          *,
          profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
          categories(id, name, slug)
        `);

      if (isUuid) {
        query = query.or(`id.eq.${cleanSlug},slug.eq."${cleanSlug}"`);
      } else {
        query = query.eq("slug", cleanSlug);
      }

      let { data, error } = await query.maybeSingle();

      if (!data) {
        let fallbackQuery = supabase.from("products").select("*");
        if (isUuid) {
          fallbackQuery = fallbackQuery.or(
            `id.eq.${cleanSlug},slug.eq."${cleanSlug}"`
          );
        } else {
          fallbackQuery = fallbackQuery.eq("slug", cleanSlug);
        }
        const fallbackRes = await fallbackQuery.maybeSingle();
        if (fallbackRes.data) {
          data = fallbackRes.data as any;
          error = null;
        }
      }

      if (error) {
        console.error("Error fetching product from Supabase:", error);
      }

      if (!data) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct({
        ...(data as any),
        title: fixVietnameseEncoding((data as any)?.title),
        short_description: fixVietnameseEncoding(
          (data as any)?.short_description
        ),
        thumbnail_url: sanitizeImageUrl((data as any)?.thumbnail_url),
        images: sanitizeImageArray((data as any)?.images),
      } as ProductDetailData);

      if (data?.id) {
        supabase
          .from("reviews")
          .select(
            `
              id,
              rating,
              comment,
              is_verified_purchase,
              created_at,
              profiles:buyer_id(full_name, avatar_url)
            `
          )
          .eq("product_id", data.id)
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
          .limit(10)
          .then(
            ({ data: reviewsData }) => {
              if (reviewsData) {
                setReviews(reviewsData as unknown as ProductReview[]);
              }
            },
            () => { }
          );

        // Non-blocking view increment
        supabase
          .from("products")
          .update({ view_count: ((data as any).view_count || 0) + 1 })
          .eq("id", data.id)
          .then(
            () => { },
            () => { }
          );
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // Load seller's aggregate stats for the seller sidebar card
  useEffect(() => {
    if (!product?.seller_id) return;
    let cancelled = false;
    supabase
      .from("products")
      .select("rating_average, rating_count")
      .eq("seller_id", product.seller_id)
      .eq("status", "active")
      .then(
        ({ data }) => {
          if (cancelled || !data) return;
          let wSum = 0;
          let rTotal = 0;
          for (const row of data) {
            const rc = Number(row.rating_count) || 0;
            const ra = Number(row.rating_average) || 0;
            if (rc > 0 && ra > 0) {
              wSum += rc * ra;
              rTotal += rc;
            }
          }
          setSellerStats({
            productsCount: data.length,
            avgRating: rTotal > 0 ? wSum / rTotal : 0,
          });
        },
        () => { }
      );
    return () => {
      cancelled = true;
    };
  }, [product?.seller_id]);

  const handleBuyNow = () => {
    if (product) {
      addToCart(product.id);
      navigate("/cart");
    }
  };

  const cycleFontSize = (dir: "down" | "up") => {
    const order: Array<"sm" | "base" | "lg"> = ["sm", "base", "lg"];
    const idx = order.indexOf(readingFontSize);
    const nextIdx =
      dir === "up"
        ? Math.min(order.length - 1, idx + 1)
        : Math.max(0, idx - 1);
    setReadingFontSize(order[nextIdx] || "base");
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFullscreenChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!readingMode || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        setReadingMode(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [readingMode]);

  const closeReadingMode = () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
    setReadingMode(false);
  };

  const toggleNativeFullscreen = async () => {
    if (typeof document === "undefined") return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      toast({
        title: "Trình duyệt không hỗ trợ toàn màn hình hệ thống",
        description: "Chế độ đọc toàn khung trình duyệt vẫn đang hoạt động.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="h-5 w-64 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-32 animate-pulse rounded-2xl bg-muted" />
              <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-80 animate-pulse rounded-2xl bg-muted" />
              <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isUnavailable =
    !product ||
    product.status === "deleted" ||
    (!authLoading &&
      !isOwner &&
      Boolean(product.status) &&
      product.status !== "active");

  if (isUnavailable || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
          <ErrorState
            title="Sản phẩm này hiện không có sẵn"
            description="Tài liệu này có thể đã bị người bán gỡ bỏ, tạm ẩn hoặc đường dẫn không tồn tại."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link to="/search">Tìm tài liệu khác</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Về trang chủ</Link>
                </Button>
              </div>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const siteUrl = "https://salemylink.com";
  const currentPath = `/san-pham/${product.slug}`;
  const productUrl = `${siteUrl}${currentPath}`;
  const isFree = isFreeProduct(product.price);
  const freeDownloadUrl = getProductDownloadUrl(
    product.google_drive_link,
    product.download_only_link
  );
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
        100
      )
      : 0;

  const langCode = inferProductLanguage(product);
  const langLabel = SHORT_LANG_LABELS[langCode] || "Tiếng Việt";
  const sellerName = fixVietnameseEncoding(
    product.profiles?.full_name || "Người bán"
  );
  const sellerSlug = getSellerSlug({
    full_name: sellerName,
    user_id: product.profiles?.user_id || product.seller_id,
  });
  const sellerHref = `/nguoi-ban/${sellerSlug}`;

  const previewUrl =
    product.google_drive_link && !product.download_only_link
      ? getGoogleDrivePreviewUrl(product.google_drive_link)
      : null;

  const proseSizeClass =
    readingFontSize === "sm"
      ? "prose-sm"
      : readingFontSize === "lg"
        ? "prose-lg"
        : "prose-base";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Full-Screen Immersive Reading Overlay */}
      {readingMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Chế độ đọc toàn màn hình: ${product.title}`}
          className={`fixed inset-0 z-[60] flex flex-col overflow-hidden transition-colors ${readingPaper === "sepia"
              ? "bg-[#f6efe0] text-[#3a2f1d]"
              : "bg-background text-foreground"
            }`}
        >
          {/* Full-screen top toolbar */}
          <header
            className={`shrink-0 border-b px-3 py-2 sm:px-6 ${readingPaper === "sepia"
                ? "border-[#e6dcc4] bg-[#fbf6ea]"
                : "border-border bg-surface"
              }`}
          >
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 sm:h-9 px-2.5 gap-1.5 text-xs shrink-0"
                  onClick={closeReadingMode}
                  aria-label="Thoát chế độ đọc"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Quay lại</span>
                </Button>
                <BookOpen className="h-4 w-4 shrink-0 text-primary hidden md:inline" />
                <span className="truncate text-sm font-semibold max-w-[170px] sm:max-w-[320px] lg:max-w-[520px]">
                  {product.title}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 sm:h-9 px-2.5 text-xs"
                  onClick={() => cycleFontSize("down")}
                  disabled={readingFontSize === "sm"}
                  aria-label="Giảm cỡ chữ"
                >
                  <Type className="h-3.5 w-3.5 mr-1" />
                  A-
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 sm:h-9 px-2.5 text-xs"
                  onClick={() => cycleFontSize("up")}
                  disabled={readingFontSize === "lg"}
                  aria-label="Tăng cỡ chữ"
                >
                  <Type className="h-3.5 w-3.5 mr-1" />
                  A+
                </Button>
                <Button
                  type="button"
                  variant={readingPaper === "sepia" ? "default" : "outline"}
                  size="sm"
                  className="min-h-11 sm:h-9 px-2.5 text-xs gap-1"
                  onClick={() =>
                    setReadingPaper((p) => (p === "white" ? "sepia" : "white"))
                  }
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {readingPaper === "sepia" ? "Nền trắng" : "Giấy ngà"}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 sm:h-9 px-2.5 text-xs gap-1"
                  onClick={toggleNativeFullscreen}
                  aria-label={
                    isNativeFullscreen
                      ? "Thu nhỏ màn hình trình duyệt"
                      : "Phóng to toàn màn hình trình duyệt"
                  }
                  title={
                    isNativeFullscreen ? "Thu nhỏ (Esc)" : "Toàn màn hình (F11)"
                  }
                >
                  {isNativeFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden lg:inline">
                    {isNativeFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
                  </span>
                </Button>

                {product.read_only && product.google_drive_link ? (
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-11 sm:h-9 px-3 text-xs gap-1"
                    onClick={() => {
                      closeReadingMode();
                      navigate(`/read/${product.slug}`);
                    }}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Bản đọc bảo vệ</span>
                  </Button>
                ) : isFree ? (
                  <FreeDownloadButton
                    size="sm"
                    className="min-h-11 sm:h-9 px-3 text-xs"
                    downloadUrl={freeDownloadUrl}
                    onMissingUrl={() => {
                      toast({
                        title: "Thiếu link tải",
                        description:
                          "Tài liệu miễn phí này hiện chưa có link tải hợp lệ",
                        variant: "destructive",
                      });
                    }}
                  />
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-11 sm:h-9 px-3 text-xs"
                    onClick={() => {
                      closeReadingMode();
                      handleBuyNow();
                    }}
                  >
                    Mua ngay · {formatMoneyVnd(product.price)}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-11 sm:h-9 px-3 text-xs gap-1"
                  onClick={closeReadingMode}
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Thoát</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Scrollable Full-Screen Reading Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-6 sm:py-6 space-y-6">
              {previewUrl && (
                <section aria-label="Bản xem trước toàn màn hình">
                  <div className="relative h-[calc(100dvh-132px)] min-h-[460px] w-full overflow-hidden rounded-xl border border-current/15 bg-muted shadow-sm">
                    <iframe
                      src={previewUrl}
                      className="h-full w-full"
                      frameBorder="0"
                      title={`Đọc toàn màn hình ${product.title}`}
                      sandbox="allow-same-origin allow-scripts"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}

              {!previewUrl && !product.download_only_link && product.thumbnail_url && (
                <div className="flex justify-center">
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="max-h-[75dvh] w-auto rounded-xl border border-current/15 object-contain bg-surface"
                  />
                </div>
              )}

              <article
                className={`mx-auto max-w-[74ch] rounded-2xl border p-5 sm:p-8 transition-colors ${readingPaper === "sepia"
                    ? "border-[#e6dcc4] bg-[#fbf6ea] text-[#3a2f1d]"
                    : "border-border bg-surface text-foreground"
                  }`}
              >
                <div className="mb-5 border-b border-current/10 pb-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs opacity-75">
                    {product.categories?.name && (
                      <span>{product.categories.name}</span>
                    )}
                    {product.file_format && (
                      <span className="font-mono uppercase">
                        · {product.file_format}
                      </span>
                    )}
                    {product.file_size && <span>· {product.file_size}</span>}
                  </div>
                  <h2 className="text-xl font-bold leading-snug sm:text-2xl">
                    {product.title}
                  </h2>
                  {product.short_description && (
                    <p className="text-sm leading-relaxed opacity-85 sm:text-base">
                      {product.short_description}
                    </p>
                  )}
                </div>

                <TableOfContents htmlContent={product.description || ""} />

                {product.description ? (
                  <div
                    className={`prose ${proseSizeClass} max-w-none break-words [overflow-wrap:anywhere] prose-headings:font-bold prose-headings:scroll-mt-24 prose-a:text-primary prose-img:rounded-xl prose-img:mx-auto ${readingPaper === "sepia"
                        ? "text-[#3a2f1d] prose-headings:text-[#2a2112]"
                        : ""
                      }`}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeProductHtml(product.description || ""),
                    }}
                  />
                ) : (
                  <p className="text-sm opacity-75">
                    Người bán chưa bổ sung mô tả chi tiết cho tài liệu này.
                  </p>
                )}
              </article>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Seller Owner Banner */}
        {isOwner && (
          <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-primary/25 bg-secondary/50 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground sm:text-base">
                    Bạn là người bán tài liệu này
                  </span>
                  <Badge
                    variant={
                      product.status === "active" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {product.status === "active" ? "Đang mở bán" : "Bản nháp"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  Cập nhật mô tả, tiêu đề SEO, giá bán và link Google Drive bất cứ
                  lúc nào.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5"
              >
                <Pencil className="h-4 w-4" />
                <span>Chỉnh sửa</span>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/seller-dashboard">Quản lý kho</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            ...(product.categories?.slug
              ? [
                {
                  label: product.categories.name,
                  href: `/danh-muc/${product.categories.slug}`,
                },
              ]
              : product.categories?.name
                ? [{ label: product.categories.name }]
                : []),
            { label: product.title },
          ]}
        />

        {/* Two-column layout: Reader Left (8 cols) + Sticky Purchase/Seller/Related Right (4 cols) */}
        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* MAIN READING & CONTENT COLUMN */}
          <div className="min-w-0 space-y-6 lg:col-span-8">
            {/* Product Header Card */}
            <header className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {product.categories && (
                  <Link
                    to={`/danh-muc/${product.categories.slug}`}
                    className="inline-flex min-h-11 sm:min-h-7 items-center rounded-full bg-secondary px-3 py-1 sm:px-2.5 sm:py-0.5 text-xs font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {product.categories.name}
                  </Link>
                )}
                {product.file_format && (
                  <Badge variant="outline" className="text-xs font-mono uppercase">
                    {product.file_format}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs font-medium">
                  {langLabel}
                </Badge>
                {product.file_size && (
                  <span className="text-xs text-muted-foreground">
                    · {product.file_size}
                  </span>
                )}
              </div>

              <h1 className="break-words [overflow-wrap:anywhere] text-2xl font-bold leading-snug tracking-tight text-balance text-foreground sm:text-3xl">
                {product.title}
              </h1>

              {product.short_description && (
                <p className="break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
                  {product.short_description}
                </p>
              )}

              {/* Quick Stats Row */}
              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 border-t border-border pt-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i <
                            Math.round(
                              product.rating_count > 0
                                ? product.rating_average || 0
                                : 0
                            )
                            ? "h-4 w-4 fill-[var(--status-star)] text-[var(--status-star)]"
                            : "h-4 w-4 text-muted-foreground/30"
                        }
                      />
                    ))}
                  </div>
                  {product.rating_count > 0 ? (
                    <span className="font-medium text-foreground tabular-nums">
                      {(product.rating_average || 5).toFixed(1)} ★{" "}
                      <span className="font-normal text-muted-foreground">
                        ({product.rating_count} đánh giá)
                      </span>
                    </span>
                  ) : (
                    <span>Chưa có đánh giá</span>
                  )}
                </div>

                <div className="flex items-center gap-1 tabular-nums">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>{product.download_count || 0} lượt tải</span>
                </div>

                <div className="flex items-center gap-1 tabular-nums">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{product.view_count || 0} lượt xem</span>
                </div>
              </div>
            </header>

            {/* Mobile Quick Purchase Card (<lg) */}
            <div className="rounded-2xl border border-border bg-surface p-4 space-y-3 lg:hidden">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xl font-bold text-primary tabular-nums">
                    {isFree ? "Miễn phí" : formatMoneyVnd(product.price)}
                  </span>
                  {discount > 0 && product.original_price && (
                    <>
                      <span className="text-xs text-muted-foreground line-through tabular-nums">
                        {formatMoneyVnd(product.original_price)}
                      </span>
                      <span className="rounded-full bg-[var(--tint-danger-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--status-danger)] tabular-nums">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>
                <WishlistButton productId={product.id} variant="inline" />
              </div>

              {product.read_only ? (
                product.google_drive_link && (
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 font-semibold"
                    onClick={() => navigate(`/read/${product.slug}`)}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Đọc trực tuyến (Toàn màn hình)</span>
                  </Button>
                )
              ) : isFree ? (
                <FreeDownloadButton
                  size="lg"
                  className="h-12 w-full font-semibold"
                  downloadUrl={freeDownloadUrl}
                  onMissingUrl={() => {
                    toast({
                      title: "Thiếu link tải",
                      description:
                        "Tài liệu miễn phí này hiện chưa có link tải hợp lệ",
                      variant: "destructive",
                    });
                  }}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => addToCart(product.id)}
                    className="h-12 gap-1.5 font-medium"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Thêm giỏ</span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleBuyNow}
                    className="h-12 font-semibold"
                  >
                    Mua ngay
                  </Button>
                </div>
              )}
            </div>

            {/* Preview & Reading Mode Frame */}
            <section
              aria-label="Xem trước tài liệu"
              className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Xem trước tài liệu
                  </span>
                </div>

                {/* Inline Reading Mode Controls */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 sm:h-9 px-2.5 text-xs"
                    onClick={() => cycleFontSize("down")}
                    disabled={readingFontSize === "sm"}
                    title="Giảm cỡ chữ"
                  >
                    A-
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 sm:h-9 px-2.5 text-xs"
                    onClick={() => cycleFontSize("up")}
                    disabled={readingFontSize === "lg"}
                    title="Tăng cỡ chữ"
                  >
                    A+
                  </Button>
                  <Button
                    type="button"
                    variant={readingPaper === "sepia" ? "secondary" : "outline"}
                    size="sm"
                    className="min-h-11 sm:h-9 px-2.5 text-xs gap-1"
                    onClick={() =>
                      setReadingPaper((p) => (p === "white" ? "sepia" : "white"))
                    }
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>{readingPaper === "sepia" ? "Nền trắng" : "Giấy ngà"}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 sm:h-9 px-3 text-xs gap-1.5"
                    onClick={() => setReadingMode(true)}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Chế độ đọc</span>
                  </Button>
                </div>
              </div>

              <div className="relative h-[420px] sm:h-[520px] w-full overflow-hidden rounded-xl border border-border bg-muted">
                {product.download_only_link ? (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                    {product.thumbnail_url && (
                      <img
                        src={product.thumbnail_url}
                        alt={`${product.title} - ${product.categories?.name || ""}`}
                        className="mb-5 max-h-48 max-w-full rounded-lg object-contain"
                        loading="lazy"
                      />
                    )}
                    <p className="text-base font-semibold text-foreground">
                      Tài liệu đóng gói để tải trực tiếp
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Định dạng: {product.file_format || "ZIP/File"}
                      {product.file_size ? ` · ${product.file_size}` : ""}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {isFree
                        ? "Nhấn tải miễn phí bên dưới hoặc ở thanh công cụ để nhận link Google Drive."
                        : "Mua sản phẩm để nhận link tải xuống ngay lập tức."}
                    </p>
                  </div>
                ) : previewUrl ? (
                  !readingMode ? (
                    <iframe
                      src={previewUrl}
                      className="h-full w-full"
                      frameBorder="0"
                      title={`Xem trước ${product.title}`}
                      sandbox="allow-same-origin allow-scripts"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-sm text-muted-foreground">
                      Đang mở ở chế độ đọc toàn màn hình...
                    </div>
                  )
                ) : product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="h-full w-full object-contain bg-surface"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                    <FileText className="mb-2 h-10 w-10 opacity-40" />
                    <p className="text-sm font-medium">
                      Chưa có bản xem trước cho tài liệu này
                    </p>
                  </div>
                )}
              </div>

              {product.google_drive_link && !product.download_only_link && (
                <p className="text-center text-xs text-muted-foreground">
                  Đây là bản xem trước trực tuyến qua Google Drive. Mua sản phẩm để
                  mở khóa bản đầy đủ và tải về máy.
                </p>
              )}
            </section>

            {/* Detailed Description + Table Of Contents (respects Reading Mode Paper & Size) */}
            <article
              className={`rounded-2xl border p-5 sm:p-7 transition-colors ${readingPaper === "sepia"
                  ? "border-[#e6dcc4] bg-[#fbf6ea] text-[#3a2f1d]"
                  : "border-border bg-surface text-foreground"
                }`}
            >
              <div className="max-w-[72ch]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-current/10 pb-3">
                  <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                    Nội dung chi tiết tài liệu
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setReadingMode(true)}
                      className="min-h-11 sm:h-9 gap-1.5 text-xs"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Chế độ đọc</span>
                    </Button>
                    {product.read_only && product.google_drive_link && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/read/${product.slug}`)}
                        className="min-h-11 sm:h-9 gap-1.5 text-xs"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Mở toàn màn hình</span>
                      </Button>
                    )}
                  </div>
                </div>

                <TableOfContents htmlContent={product.description || ""} />

                {product.description ? (
                  <div
                    className={`prose ${proseSizeClass} max-w-none break-words [overflow-wrap:anywhere] prose-headings:font-bold prose-headings:scroll-mt-24 prose-a:text-primary prose-img:rounded-xl prose-img:mx-auto ${readingPaper === "sepia"
                        ? "text-[#3a2f1d] prose-headings:text-[#2a2112]"
                        : ""
                      }`}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeProductHtml(product.description || ""),
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Người bán chưa bổ sung mô tả chi tiết cho tài liệu này.
                  </p>
                )}
              </div>
            </article>

            {/* Product FAQ */}
            <Card className="rounded-2xl border-border bg-surface">
              <CardContent className="p-5 sm:p-6">
                <ProductFAQ
                  productName={product.title}
                  category={product.categories?.name || "Digital"}
                  fileFormat={product.file_format}
                />
              </CardContent>
            </Card>

            {/* Product Reviews */}
            <ProductReviews productId={product.id} initialReviews={reviews} />
          </div>

          {/* STICKY RIGHT SIDEBAR (Purchase + Share + Seller + 3 Related Products) */}
          <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-20">
            {/* 1. Purchase (Desktop only, avoids repeating mobile CTA) + Share & Tags Card */}
            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-4">
              <div className="hidden lg:block space-y-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Giá tài liệu
                  </span>
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary sm:text-3xl tabular-nums">
                      {isFree ? "Miễn phí" : formatMoneyVnd(product.price)}
                    </span>
                    {discount > 0 && product.original_price && (
                      <>
                        <span className="text-sm text-muted-foreground line-through tabular-nums">
                          {formatMoneyVnd(product.original_price)}
                        </span>
                        <span className="rounded-full bg-[var(--tint-danger-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--status-danger)] tabular-nums">
                          -{discount}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary CTAs */}
                <div className="space-y-2.5">
                  {product.read_only ? (
                    product.google_drive_link && (
                      <Button
                        size="lg"
                        className="h-12 w-full gap-2 font-semibold"
                        onClick={() => navigate(`/read/${product.slug}`)}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Đọc trực tuyến (Toàn màn hình)</span>
                      </Button>
                    )
                  ) : isFree ? (
                    <FreeDownloadButton
                      size="lg"
                      className="h-12 w-full font-semibold"
                      downloadUrl={freeDownloadUrl}
                      onMissingUrl={() => {
                        toast({
                          title: "Thiếu link tải",
                          description:
                            "Tài liệu miễn phí này hiện chưa có link tải hợp lệ",
                          variant: "destructive",
                        });
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => addToCart(product.id)}
                        className="h-12 gap-1.5 font-medium"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Thêm giỏ</span>
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleBuyNow}
                        className="h-12 gap-1.5 font-semibold"
                      >
                        <span>Mua ngay</span>
                      </Button>
                    </div>
                  )}

                  <WishlistButton
                    productId={product.id}
                    variant="inline"
                    showLabel
                    className="w-full justify-center"
                  />

                  {isOwner && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-full gap-1.5 border-primary/30 text-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Chỉnh sửa sản phẩm</span>
                    </Button>
                  )}
                </div>

                {/* Instant delivery guarantees */}
                <div className="space-y-1.5 rounded-xl bg-muted/50 p-3 text-xs text-pretty text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--status-success)]" />
                    <span>Nhận link Google Drive tức thì sau thanh toán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--status-success)]" />
                    <span>Thanh toán tự động PayOS / VietQR 24/7</span>
                  </div>
                </div>
              </div>

              {/* Social Share Buttons (Zalo / FB / Telegram / Copy) */}
              <div className="lg:border-t lg:border-border lg:pt-3.5">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">
                  Chia sẻ tài liệu
                </span>
                <ShareButtons url={productUrl} title={product.title} />
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="border-t border-border pt-3.5">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">
                    Tags liên quan
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/tag/${encodeURIComponent(tag)}`}
                        className="inline-flex min-h-11 sm:min-h-8 items-center rounded-full border border-border bg-surface px-3 py-1 sm:px-2.5 sm:py-0.5 text-xs text-foreground hover:bg-button-hover hover:text-primary transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Seller Info + Follow Card */}
            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-primary" />
                  <span>Tác giả / Người bán</span>
                </span>
                <Link
                  to={sellerHref}
                  className="inline-flex min-h-11 sm:min-h-8 items-center text-xs font-medium text-primary hover:underline"
                >
                  Xem shop →
                </Link>
              </div>

              <Link
                to={sellerHref}
                className="group flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface p-2 hover:bg-button-hover transition-colors"
              >
                <Avatar className="size-11 shrink-0 ring-1 ring-border">
                  {product.profiles?.avatar_url && (
                    <AvatarImage
                      src={product.profiles.avatar_url}
                      alt={sellerName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="text-xs font-semibold">
                    {sellerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {sellerName}
                    </span>
                    <VerifiedBadge
                      verified={product.profiles?.is_verified}
                      size="sm"
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    {sellerStats
                      ? `${sellerStats.productsCount} sản phẩm${sellerStats.avgRating > 0
                        ? ` · ${sellerStats.avgRating.toFixed(1)} ★`
                        : ""
                      }`
                      : "Xem toàn bộ tài liệu của người bán"}
                  </p>
                </div>
              </Link>

              {product.seller_id && (
                <FollowButton
                  sellerId={product.seller_id}
                  showCount
                  fullWidth
                />
              )}
            </div>

            {/* 3. Related Products (3 items in sticky right sidebar per Spec 3.3) */}
            <RelatedProducts
              variant="sidebar"
              limit={3}
              categoryId={product.category_id}
              currentProductId={product.id}
              categorySlug={product.categories?.slug}
            />
          </aside>
        </div>

        {/* Bottom Recommendations ("Sản phẩm bạn có thể thích" — Spec 3.5) */}
        <RecommendedProducts
          title="Sản phẩm bạn có thể thích"
          limit={3}
          categoryId={product.category_id}
          excludeIds={[product.id]}
        />

        {/* Related Categories — internal linking for SEO */}
        <RelatedCategories
          currentCategoryId={product.category_id}
          title="Khám phá danh mục khác"
        />

        {/* Edit Product Modal */}
        {isEditing && product && (
          <EditProductForm
            product={product as any}
            onClose={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              fetchProduct();
              toast({
                title: "Thành công",
                description: "Đã cập nhật thông tin sản phẩm thành công",
              });
            }}
            onDelete={() => {
              setIsEditing(false);
              toast({
                title: "Đã xóa",
                description: "Sản phẩm đã được xóa",
              });
              navigate("/seller-dashboard");
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
