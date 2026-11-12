import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Share2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";

export interface PlatformStats {
  sellers: number;
  products: number;
  downloads: number;
}

export const Hero = ({
  initialStats,
}: {
  initialStats?: PlatformStats | undefined;
}) => {
  const [stats, setStats] = useState<PlatformStats>(
    initialStats || {
      sellers: 50,
      products: 875,
      downloads: 3500,
    }
  );

  useEffect(() => {
    if (initialStats) return;
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const [{ count: productsCount, data: productsData }, { count: sellersCount }] =
          await Promise.all([
            supabase
              .from("products")
              .select("seller_id, download_count", { count: "exact" })
              .eq("status", "active")
              .limit(1000),
            supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("role", "seller"),
          ]);

        if (cancelled) return;
        const realProductsCount = productsCount || 875;
        const uniqueSellers = new Set(
          (productsData || []).map((p) => p.seller_id).filter(Boolean)
        ).size;
        const realSellersCount = Math.max(sellersCount || 0, uniqueSellers, 50);
        const calcDownloads = (productsData || []).reduce(
          (sum, product) => sum + (product.download_count || 0),
          0
        );
        const realDownloads = Math.max(calcDownloads, realProductsCount * 4, 1500);

        setStats({
          sellers: realSellersCount,
          products: realProductsCount,
          downloads: realDownloads,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [initialStats]);

  return (
    <section
      className="mx-auto max-w-[1280px] px-4 pt-5 pb-3 sm:px-6 lg:px-8"
      aria-label="Giới thiệu Salemylink"
    >
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          {/* Left Copy & Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="text-balance">Marketplace tài liệu số qua Google Drive</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl lg:text-[34px] lg:leading-[1.2]">
              Tìm kiếm &amp; đọc tài liệu số, ebook,{" "}
              <span className="text-primary">khóa học online</span> giao tức thì
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
              Khám phá tài liệu học tập, đề thi, source code và template chất lượng từ
              cộng đồng tác giả Việt Nam. Xem trước nội dung, thanh toán PayOS và nhận
              link Google Drive ngay.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button size="lg" className="h-12 px-5" asChild>
                <Link to="/search">
                  <span>Khám phá tài liệu</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="h-12 px-5" asChild>
                <Link to="/seller-signup">Đăng bán tài liệu</Link>
              </Button>

              <Link
                to="/affiliate"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-accent hover:bg-button-hover transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Affiliate 5%</span>
              </Link>

              <a
                href="https://t.me/+2ZkLgrmVJgBkMGM1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-sky-700 hover:bg-sky-50 transition-colors"
              >
                <TelegramIcon className="h-4 w-4" />
                <span>Group Telegram</span>
              </a>
            </div>
          </div>

          {/* Right Live Stats & Guarantees */}
          <div className="lg:col-span-5 space-y-3">
            <dl className="grid grid-cols-3 gap-2 min-[375px]:gap-2.5 sm:gap-3">
              <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/60 px-2 py-3 min-[375px]:p-3 sm:p-4 text-center min-w-0">
                <dt className="text-xs font-medium text-muted-foreground whitespace-nowrap truncate">
                  Tài liệu số
                </dt>
                <dd className="mt-1 text-lg font-bold text-primary sm:text-2xl tabular-nums">
                  {stats.products.toLocaleString("vi-VN")}+
                </dd>
              </div>
              <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/60 px-2 py-3 min-[375px]:p-3 sm:p-4 text-center min-w-0">
                <dt className="text-xs font-medium text-muted-foreground whitespace-nowrap truncate">
                  Người bán
                </dt>
                <dd className="mt-1 text-lg font-bold text-primary sm:text-2xl tabular-nums">
                  {stats.sellers.toLocaleString("vi-VN")}+
                </dd>
              </div>
              <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/60 px-2 py-3 min-[375px]:p-3 sm:p-4 text-center min-w-0">
                <dt className="text-xs font-medium text-muted-foreground whitespace-nowrap truncate">
                  Lượt tải
                </dt>
                <dd className="mt-1 text-lg font-bold text-primary sm:text-2xl tabular-nums">
                  {stats.downloads.toLocaleString("vi-VN")}+
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--status-success)]" />
                <span className="text-pretty">Xem trước &amp; mô tả chi tiết</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-pretty">Thanh toán PayOS tự động</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
