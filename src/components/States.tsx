import type { LucideIcon } from "lucide-react";
import { AlertCircle, RefreshCw, SearchX } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- */
/* Loading skeleton                                                   */
/* ---------------------------------------------------------------- */

export const ProductCardSkeleton = () => (
  <div
    className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4"
    aria-busy="true"
  >
    <div className="aspect-4/3 w-full animate-pulse rounded-xl bg-muted" />
    <div className="mt-3 flex gap-2">
      <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
    </div>
    <div className="mt-2.5 h-4 w-11/12 animate-pulse rounded bg-muted" />
    <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded bg-muted" />
    <div className="mt-2.5 h-3.5 w-full animate-pulse rounded bg-muted" />
    <div className="mt-1.5 h-3.5 w-4/5 animate-pulse rounded bg-muted" />
    <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
      <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      <div className="h-9 w-24 animate-pulse rounded-xl bg-muted" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) => (
  <div
    aria-hidden="true"
    className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5", className)}
  >
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/* ---------------------------------------------------------------- */
/* Empty state                                                        */
/* ---------------------------------------------------------------- */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <section
    className={cn(
      "flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-14 text-center",
      className
    )}
  >
    <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <h2 className="mt-4 text-lg font-semibold text-balance text-foreground">{title}</h2>
    {description && (
      <p className="mt-1.5 max-w-md text-sm text-pretty text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </section>
);

/* ---------------------------------------------------------------- */
/* Error state                                                        */
/* ---------------------------------------------------------------- */

interface ErrorStateProps {
  title?: string | undefined;
  description?: string | undefined;
  onRetry?: (() => void) | undefined;
  showHomeLink?: boolean | undefined;
  action?: React.ReactNode | undefined;
  className?: string | undefined;
}

export const ErrorState = ({
  title = "Không tải được dữ liệu",
  description = "Đã có sự cố khi kết nối. Vui lòng thử lại sau ít phút.",
  onRetry,
  showHomeLink = true,
  action,
  className,
}: ErrorStateProps) => (
  <section
    role="alert"
    className={cn(
      "flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-14 text-center",
      className
    )}
  >
    <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--tint-danger-bg)]">
      <AlertCircle className="h-6 w-6 text-[var(--status-danger)]" />
    </div>
    <h2 className="mt-4 text-lg font-semibold text-balance text-foreground">{title}</h2>
    <p className="mt-1.5 max-w-md text-sm text-pretty text-muted-foreground">{description}</p>
    {(action || onRetry || showHomeLink) && (
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {action}
        {onRetry && (
          <Button className="min-h-10" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            <span>Thử lại</span>
          </Button>
        )}
        {showHomeLink && !action && (
          <Button variant="outline" className="min-h-10" asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
        )}
      </div>
    )}
  </section>
);
