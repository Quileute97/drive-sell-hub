import { useEffect, useState } from "react";
import { ShieldCheck, Star, Store, Users, Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SellerCard, type SellerCardData } from "@/components/SellerCard";
import { EmptyState } from "@/components/States";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export default function Sellers({
  initialSellers,
}: {
  initialSellers?: SellerCardData[];
}) {
  const [sellers, setSellers] = useState<SellerCardData[]>(
    initialSellers || []
  );
  const [loading, setLoading] = useState(!initialSellers);

  useEffect(() => {
    if (initialSellers && initialSellers.length > 0) return;

    let cancelled = false;
    const fetchSellers = async () => {
      try {
        const { data: activeProducts, error } = await supabase
          .from("products")
          .select(
            "seller_id, rating_average, rating_count, profiles!products_seller_id_fkey(user_id, full_name, avatar_url, created_at, is_verified)"
          )
          .eq("status", "active")
          .limit(1000);

        if (error) throw error;
        if (cancelled) return;

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

        for (const row of activeProducts || []) {
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
            item.weightedSum += rc * ra;
            item.reviewsCount += rc;
          }
          sellerMap.set(sid, item);
        }

        const formatted: SellerCardData[] = Array.from(sellerMap.values())
          .sort(
            (a, b) =>
              (b.is_verified ? 50 : 0) +
              b.reviewsCount * 20 +
              b.productsCount * 3 -
              ((a.is_verified ? 50 : 0) +
                a.reviewsCount * 20 +
                a.productsCount * 3)
          )
          .map((s) => ({
            user_id: s.user_id,
            full_name: s.full_name,
            avatar_url: s.avatar_url,
            created_at: s.created_at,
            is_verified: s.is_verified,
            productsCount: s.productsCount,
            avgRating: s.reviewsCount > 0 ? s.weightedSum / s.reviewsCount : 0,
          }));

        setSellers(formatted);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSellers();
    return () => {
      cancelled = true;
    };
  }, [initialSellers]);

  const pageUrl = "https://salemylink.com/nguoi-ban";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Người bán sản phẩm Digital uy tín | Salemylink.com"
        description={`Khám phá ${sellers.length}+ người bán uy tín trên Salemylink.com. Mua ebook, tài liệu, khóa học online từ các seller được xác minh với đánh giá cao.`}
        keywords="người bán digital, seller uy tín, bán ebook, bán tài liệu, bán khóa học, salemylink sellers, người bán sản phẩm số"
        url={pageUrl}
      />
      <Header />

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <Breadcrumb items={[{ label: "Người bán" }]} />

        {/* Page Header */}
        <header className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Store className="h-3.5 w-3.5" />
                <span>Cộng đồng tác giả &amp; Shop uy tín</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Người bán trên Salemylink
              </h1>
              <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
                Khám phá các người bán chất lượng với kho tài liệu, ebook,
                template được cộng đồng đánh giá cao.
              </p>
            </div>
            {!loading && (
              <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-primary tabular-nums">
                <Users className="h-4 w-4" />
                <span>{sellers.length} người bán</span>
              </div>
            )}
          </div>
        </header>

        {/* Sellers Grid */}
        {loading ? (
          <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-surface p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Chưa có người bán nào trên nền tảng"
            description="Hãy quay lại sau để khám phá các người bán nổi bật."
          />
        ) : (
          <section
            aria-label="Danh sách người bán"
            className="grid gap-3.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {sellers.map((seller) => (
              <SellerCard key={seller.user_id} seller={seller} />
            ))}
          </section>
        )}

        {/* Trust Highlights */}
        <section
          aria-label="Cam kết từ người bán"
          className="rounded-2xl border border-border bg-surface p-5 sm:p-7"
        >
          <h2 className="mb-5 text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Tại sao nên mua từ người bán trên Salemylink?
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <ShieldCheck className="mb-2.5 h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                An toàn &amp; Bảo mật
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Thanh toán qua cổng PayOS uy tín, bảo vệ thông tin khách hàng.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <Zap className="mb-2.5 h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">
                Giao hàng tức thì
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Nhận link Google Drive ngay lập tức sau khi thanh toán thành công.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <Star className="mb-2.5 h-5 w-5 text-[var(--status-star)]" />
              <h3 className="text-sm font-semibold text-foreground">
                Chất lượng kiểm chứng
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Đánh giá minh bạch từ người mua thực tế giúp bạn chọn tài liệu
                chuẩn.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
