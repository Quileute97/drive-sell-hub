import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------- */
/* Loading skeleton                                                   */
/* ---------------------------------------------------------------- */

export const ProductCardSkeleton = () => (
  <Card className="flex h-full flex-col overflow-hidden">
    <div className="aspect-4/3 animate-pulse bg-muted" />
    <CardContent className="flex grow flex-col p-4">
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mb-2 h-5 w-full animate-pulse rounded bg-muted" />
      <div className="mb-4 h-5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted" />
      <div className="mb-4 h-3 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mt-auto h-7 w-28 animate-pulse rounded bg-muted" />
    </CardContent>
  </Card>
);

export const ProductGridSkeleton = ({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) => (
  <div
    aria-hidden="true"
    className={cn(
      'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      className
    )}
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
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center animate-fade-in',
      className
    )}
  >
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
    )}
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && (
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/* ---------------------------------------------------------------- */
/* Error state                                                        */
/* ---------------------------------------------------------------- */

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = 'Không tải được dữ liệu',
  description = 'Đã có sự cố khi kết nối. Vui lòng thử lại sau ít phút.',
  onRetry,
  className,
}: ErrorStateProps) => (
  <div
    role="alert"
    className={cn(
      'flex flex-col items-center justify-center rounded-xl border border-destructive/25 bg-destructive/5 px-6 py-16 text-center animate-fade-in',
      className
    )}
  >
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
      <AlertTriangle className="h-7 w-7 text-destructive" />
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    {onRetry && (
      <Button variant="outline" className="mt-6" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Thử lại
      </Button>
    )}
  </div>
);
