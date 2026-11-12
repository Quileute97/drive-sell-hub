import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Package,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SEO, SITE_URL } from "@/components/SEO";
import { EmptyState, ErrorState } from "@/components/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import { formatMoneyVnd } from "@/lib/productQuery";
import { resolveProductImage } from "@/lib/productImages";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

interface BuyerOrderRow {
  id: string;
  order_number: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string | null;
  download_link: string | null;
  download_expires_at: string | null;
  created_at: string;
  products: {
    id: string;
    slug: string;
    title: string;
    thumbnail_url: string | null;
    images: string[] | null;
    google_drive_link: string | null;
    file_format: string | null;
    read_only: boolean | null;
  } | null;
}

const PENDING_STATUS_META = {
  label: "Chờ thanh toán",
  badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  icon: Clock,
};

const STATUS_META: Record<
  string,
  { label: string; badgeClass: string; icon: typeof Clock }
> = {
  pending: PENDING_STATUS_META,
  paid: {
    label: "Đã thanh toán",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
    icon: CheckCircle2,
  },
  delivered: {
    label: "Đã giao tài liệu",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Đã hủy",
    badgeClass: "border-border bg-muted text-muted-foreground",
    icon: XCircle,
  },
  refunded: {
    label: "Đã hoàn tiền",
    badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-700",
    icon: RefreshCw,
  },
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<BuyerOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchOrders = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data, error: err } = await supabase
          .from("orders")
          .select(
            `
            id, order_number, product_id, quantity, unit_price, total_amount,
            status, download_link, download_expires_at, created_at,
            products(id, slug, title, thumbnail_url, images, google_drive_link, file_format, read_only)
          `
          )
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (err) throw err;
        if (!cancelled) {
          setOrders((data as unknown as BuyerOrderRow[]) || []);
        }
      } catch (e) {
        console.error("Error fetching buyer orders:", e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, reloadKey]);

  const busy = authLoading || loading;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Đơn hàng của tôi | Salemylink"
        description="Quản lý và tải lại các tài liệu digital bạn đã mua trên Salemylink."
        url={`${SITE_URL}/orders`}
        noindex
      />
      <Header />

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Đơn hàng của tôi" }]} />

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
              Đơn hàng của tôi
            </h1>
            <p className="text-sm text-muted-foreground tabular-nums">
              {busy
                ? "Đang tải danh sách đơn hàng..."
                : user
                  ? `${orders.length} đơn hàng đã thực hiện`
                  : "Đăng nhập để xem lịch sử đơn hàng và link tải tài liệu"}
            </p>
          </div>
        </div>

        {busy ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-32 animate-pulse rounded-2xl border border-border bg-muted/60"
              />
            ))}
          </div>
        ) : !user ? (
          <EmptyState
            icon={ShoppingBag}
            title="Vui lòng đăng nhập"
            description="Đăng nhập để xem các đơn hàng bạn đã thanh toán và tải xuống lại tài liệu bất kỳ lúc nào."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild className="min-h-11 sm:min-h-10">
                  <Link to="/auth">Đăng nhập ngay</Link>
                </Button>
                <Button variant="outline" asChild className="min-h-11 sm:min-h-10">
                  <Link to="/search">Khám phá tài liệu</Link>
                </Button>
              </div>
            }
          />
        ) : error ? (
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Bạn chưa có đơn hàng nào"
            description="Hãy khám phá hàng trăm tài liệu học tập, ebook, khóa học và source code chất lượng trên Salemylink."
            action={
              <Button asChild className="min-h-11 sm:min-h-10">
                <Link to="/search">Khám phá tài liệu ngay</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusKey = order.status || "pending";
              const meta = STATUS_META[statusKey] ?? PENDING_STATUS_META;
              const StatusIcon = meta.icon;
              const prod = order.products;
              const prodTitle = fixVietnameseEncoding(
                prod?.title || "Sản phẩm digital"
              );
              const thumb = prod
                ? resolveProductImage({
                    thumbnail_url: prod.thumbnail_url,
                    images: prod.images,
                    google_drive_link: prod.google_drive_link,
                  })
                : null;
              const canDownload =
                (statusKey === "paid" || statusKey === "delivered") &&
                Boolean(order.download_link);

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <div className="size-16 sm:size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={prodTitle}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="h-7 w-7 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{order.order_number}
                          </span>
                          <Badge
                            variant="outline"
                            className={`gap-1 text-xs ${meta.badgeClass}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {meta.label}
                          </Badge>
                        </div>

                        {prod?.slug ? (
                          <Link
                            to={`/san-pham/${prod.slug}`}
                            className="block truncate text-base font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {prodTitle}
                          </Link>
                        ) : (
                          <h2 className="truncate text-base font-semibold text-foreground">
                            {prodTitle}
                          </h2>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
                          <span>
                            {new Date(order.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                          <span>SL: {order.quantity}</span>
                          {prod?.file_format && (
                            <span className="font-mono uppercase">
                              {prod.file_format}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end shrink-0">
                      <span className="text-lg font-bold text-primary tabular-nums">
                        {formatMoneyVnd(order.total_amount)}
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {canDownload && order.download_link && (
                          <Button
                            size="sm"
                            className="min-h-11 sm:min-h-9 gap-1.5"
                            asChild
                          >
                            <a
                              href={order.download_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                              <span>Tải tài liệu</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                        {prod?.slug && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-h-11 sm:min-h-9"
                            asChild
                          >
                            <Link to={`/san-pham/${prod.slug}`}>
                              Xem sản phẩm
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
