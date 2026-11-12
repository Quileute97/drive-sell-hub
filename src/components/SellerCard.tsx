import { Link } from "@/lib/router-compat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { FollowButton } from "@/components/FollowButton";
import { getSellerSlug } from "@/lib/sellerUtils";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";
import { cn } from "@/lib/utils";

export interface SellerCardData {
  user_id: string;
  full_name: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  is_verified?: boolean | null;
  productsCount: number;
  avgRating?: number;
}

function getInitials(name: string | null): string {
  if (!name) return "S";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "S";
}

function formatMonthYear(dateStr?: string | null): string {
  if (!dateStr) return "Shop uy tín";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Shop uy tín";
  return `Từ ${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function SellerCard({
  seller,
  className,
}: {
  seller: SellerCardData;
  className?: string;
}) {
  const sellerName = fixVietnameseEncoding(seller.full_name || "Người bán");
  const sellerHref = `/nguoi-ban/${getSellerSlug({
    full_name: sellerName,
    user_id: seller.user_id,
  })}`;
  const ratingText =
    seller.avgRating && seller.avgRating > 0 ? seller.avgRating.toFixed(1) : "5.0";

  return (
    <article
      className={cn(
        "flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4 transition-colors hover:border-[var(--border-strong)]",
        className
      )}
    >
      <Link to={sellerHref} className="group flex min-w-0 items-center gap-3">
        <Avatar className="size-10 shrink-0 ring-1 ring-border">
          {seller.avatar_url && (
            <AvatarImage src={seller.avatar_url} alt={sellerName} className="object-cover" />
          )}
          <AvatarFallback className="bg-secondary text-xs font-semibold text-foreground">
            {getInitials(sellerName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {sellerName}
            </h3>
            <VerifiedBadge verified={seller.is_verified} size="sm" />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {seller.is_verified ? "Đã xác minh · " : ""}
            {formatMonthYear(seller.created_at)}
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
        <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
          {seller.productsCount} SP · {ratingText} ★
        </span>

        <FollowButton
          sellerId={seller.user_id}
          showCount={false}
          compact
          size="sm"
        />
      </div>
    </article>
  );
}

