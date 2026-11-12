import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Download,
  Eye,
  Package,
  Star,
  Store,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FollowButton } from "@/components/FollowButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/States";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams } from "@/lib/router-compat";
import {
  fetchSellerBySlugOrId,
  getSellerSlug,
  type SellerProfileData,
} from "@/lib/sellerUtils";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

interface SellerStats {
  totalProducts: number;
  totalDownloads: number;
  totalViews: number;
  avgRating: number;
  totalReviews: number;
}

function computeSellerStats(items: any[]): SellerStats {
  if (!items || items.length === 0) {
    return {
      totalProducts: 0,
      totalDownloads: 0,
      totalViews: 0,
      avgRating: 0,
      totalReviews: 0,
    };
  }
  const totalDownloads = items.reduce(
    (sum, p) => sum + (Number(p.download_count) || 0),
    0
  );
  const totalViews = items.reduce(
    (sum, p) => sum + (Number(p.view_count) || 0),
    0
  );
  let weightedRating = 0;
  let totalReviews = 0;
  for (const p of items) {
    const rc = Number(p.rating_count) || 0;
    const ra = Number(p.rating_average) || 0;
    if (rc > 0 && ra > 0) {
      weightedRating += rc * ra;
      totalReviews += rc;
    }
  }
  return {
    totalProducts: items.length,
    totalDownloads,
    totalViews,
    avgRating: totalReviews > 0 ? weightedRating / totalReviews : 0,
    totalReviews,
  };
}

export default function SellerProfile({
  initialSeller,
  initialProducts,
}: {
  initialSeller?: SellerProfileData | null;
  initialProducts?: any[];
}) {
  const { slug, sellerId } = useParams();
  const sellerParam = decodeURIComponent((slug || sellerId || "").trim());

  const [seller, setSeller] = useState<SellerProfileData | null>(
    initialSeller || null
  );
  const [products, setProducts] = useState<ProductCardData[]>(() =>
    (initialProducts || []).map((p: any) => ({
      ...p,
      thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
      images: sanitizeImageArray(p.images),
    }))
  );
  const [loading, setLoading] = useState(!initialSeller);
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "rating">("popular");

  useEffect(() => {
    if (!sellerParam) {
      setLoading(false);
      return;
    }

    // If SSR already loaded the matching seller & products, avoid redundant loading flash
    const ssrMatch =
      initialSeller &&
      (initialSeller.user_id === sellerParam ||
        getSellerSlug(initialSeller) === sellerParam);

    if (ssrMatch) {
      setSeller(initialSeller);
      setProducts(
        (initialProducts || []).map((p: any) => ({
          ...p,
          thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
          images: sanitizeImageArray(p.images),
        }))
      );
      setLoading(false);
      return;
    }

    let cancelled = false;
    const loadSeller = async () => {
      try {
        setLoading(true);
        const foundSeller = await fetchSellerBySlugOrId(sellerParam);
        if (cancelled) return;
        if (!foundSeller) {
          setSeller(null);
          setProducts([]);
          setLoading(false);
          return;
        }
        setSeller(foundSeller);

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(
            `
            id, slug, title, short_description, description, price, original_price,
            thumbnail_url, images, google_drive_link, download_only_link, read_only,
            file_format, file_size, tags, seller_id, rating_average, rating_count,
            download_count, view_count, created_at,
            profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
            categories(id, name, slug)
          `
          )
          .eq("seller_id", foundSeller.user_id)
          .eq("status", "active")
          .order("download_count", { ascending: false });

        if (!cancelled) {
          if (productsError) throw productsError;
          setProducts(
            (productsData || []).map((p: any) => ({
              ...p,
              thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
              images: sanitizeImageArray(p.images),
            })) as ProductCardData[]
          );
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSeller();
    return () => {
      cancelled = true;
    };
  }, [sellerParam, initialSeller, initialProducts]);

  const stats = useMemo(() => computeSellerStats(products), [products]);

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    if (sortBy === "rating") {
      copy.sort(
        (a, b) =>
          (Number(b.rating_average) || 0) - (Number(a.rating_average) || 0)
      );
    } else if (sortBy === "newest") {
      copy.sort(
        (a: any, b: any) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    } else {
      copy.sort(
        (a, b) =>
          (Number(b.download_count) || 0) - (Number(a.download_count) || 0)
      );
    }
    return copy;
  }, [products, sortBy]);

  const formatJoinDate = (dateString?: string | null) => {
    if (!dateString) return "Shop uy tín";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "Shop uy tín";
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="h-5 w-52 animate-pulse rounded bg-muted" />
          <div className="h-44 w-full animate-pulse rounded-2xl bg-muted" />
          <ProductGridSkeleton count={6} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Không tìm thấy người bán"
          description="Gian hàng này không tồn tại hoặc không còn hoạt động trên Salemylink."
          noindex
        />
        <Header />
        <main className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
          <ErrorState
            title="Không tìm thấy người bán"
            description="Gian hàng này không tồn tại hoặc không còn hoạt động trên Salemylink."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link to="/nguoi-ban">Xem tất cả người bán</Link>
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

  const sellerName = fixVietnameseEncoding(seller.full_name || "Người bán");
  const sellerSlug = getSellerSlug({
    full_name: sellerName,
    user_id: seller.user_id,
  });
  const siteUrl = "https://salemylink.com";
  const sellerUrl = `${siteUrl}/nguoi-ban/${sellerSlug}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${sellerName} - Gian hàng người bán | Salemylink`}
        description={`Khám phá ${stats.totalProducts} sản phẩm digital từ ${sellerName}. ${stats.totalDownloads} lượt tải${
          stats.avgRating > 0
            ? `, đánh giá ${stats.avgRating.toFixed(1)}/5 sao`
            : ""
        }. Mua ngay tại Salemylink.com.`}
        keywords={`${sellerName}, cửa hàng, người bán, sản phẩm digital, Salemylink, ebook, tài liệu`}
        url={sellerUrl}
        image={seller.avatar_url || undefined}
      />
      <Header />

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Người bán", href: "/nguoi-ban" },
            { label: sellerName },
          ]}
        />

        {/* Seller Profile Header Card */}
        <section
          aria-label="Thông tin người bán"
          className="rounded-2xl border border-border bg-surface p-5 sm:p-7"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="size-16 sm:size-20 shrink-0 ring-2 ring-border">
                {seller.avatar_url && (
                  <AvatarImage
                    src={seller.avatar_url}
                    alt={sellerName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-secondary text-lg font-bold text-primary">
                  {sellerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-words [overflow-wrap:anywhere] text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {sellerName}
                  </h1>
                  <VerifiedBadge verified={seller.is_verified} size="md" />
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Tham gia từ {formatJoinDate(seller.created_at)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <FollowButton sellerId={seller.user_id} showCount />
            </div>
          </div>

          {/* 4 Stat Tiles */}
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
            <div className="min-w-0 rounded-xl border border-border bg-muted/40 p-3.5 text-center">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5 text-primary" />
                <span>Sản phẩm</span>
              </dt>
              <dd className="mt-1 text-xl font-bold text-primary sm:text-2xl tabular-nums">
                {stats.totalProducts}
              </dd>
            </div>

            <div className="min-w-0 rounded-xl border border-border bg-muted/40 p-3.5 text-center">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-[var(--status-star)]" />
                <span>Đánh giá TB</span>
              </dt>
              <dd className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-foreground sm:text-2xl tabular-nums">
                <span>
                  {stats.totalReviews > 0 ? stats.avgRating.toFixed(1) : "—"}
                </span>
                {stats.totalReviews > 0 && (
                  <Star className="h-4 w-4 fill-[var(--status-star)] text-[var(--status-star)]" />
                )}
              </dd>
            </div>

            <div className="min-w-0 rounded-xl border border-border bg-muted/40 p-3.5 text-center">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Download className="h-3.5 w-3.5 text-primary" />
                <span>Lượt tải</span>
              </dt>
              <dd className="mt-1 text-xl font-bold text-foreground sm:text-2xl tabular-nums">
                {stats.totalDownloads.toLocaleString("vi-VN")}
              </dd>
            </div>

            <div className="min-w-0 rounded-xl border border-border bg-muted/40 p-3.5 text-center">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5 text-primary" />
                <span>Lượt xem</span>
              </dt>
              <dd className="mt-1 text-xl font-bold text-foreground sm:text-2xl tabular-nums">
                {stats.totalViews.toLocaleString("vi-VN")}
              </dd>
            </div>
          </dl>
        </section>

        {/* Seller Products Section */}
        <section aria-labelledby="seller-products-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="seller-products-heading"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground sm:text-xl"
            >
              <Store className="h-5 w-5 text-primary" />
              <span>Sản phẩm của {sellerName} ({products.length})</span>
            </h2>

            {products.length > 1 && (
              <Select
                value={sortBy}
                onValueChange={(v) =>
                  setSortBy(v as "popular" | "newest" | "rating")
                }
              >
                <SelectTrigger
                  aria-label="Sắp xếp sản phẩm"
                  className="h-12 w-full sm:h-10 sm:w-[180px]"
                >
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Tải nhiều nhất</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="rating">Đánh giá cao</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {sortedProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Gian hàng chưa có sản phẩm nào"
              description="Người bán hiện chưa đăng bán tài liệu công khai nào."
              action={
                <Button variant="outline" asChild>
                  <Link to="/search">Khám phá tài liệu khác</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
              {sortedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  hideSeller
                  loading={index < 3 ? "eager" : "lazy"}
                  fetchPriority={index < 2 ? "high" : "auto"}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
