import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";

interface WishlistButtonProps {
  productId: string;
  className?: string | undefined;
  /** floating = circular overlay on top of a product thumbnail */
  variant?: "floating" | "inline" | undefined;
  showLabel?: boolean | undefined;
}

export const WishlistButton = ({
  productId,
  className,
  variant = "floating",
  showLabel = false,
}: WishlistButtonProps) => {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);
  const prevSavedRef = useRef(saved);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    if (!prevSavedRef.current && saved) {
      setBouncing(true);
      const t = window.setTimeout(() => setBouncing(false), 360);
      prevSavedRef.current = saved;
      return () => window.clearTimeout(t);
    }
    prevSavedRef.current = saved;
    return undefined;
  }, [saved]);

  return (
    <button
      type="button"
      aria-label={saved ? "Bỏ khỏi danh sách yêu thích" : "Lưu vào danh sách yêu thích"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors active:scale-95",
        variant === "floating"
          ? "absolute top-2.5 sm:top-3 right-2.5 sm:right-4 z-10 size-9 rounded-full bg-surface text-foreground shadow-xs ring-1 ring-border hover:bg-button-hover before:absolute before:-inset-1.5"
          : showLabel
            ? "min-h-12 sm:min-h-11 rounded-xl border border-[var(--border-strong)] bg-surface px-4 text-sm font-medium text-foreground hover:bg-button-hover"
            : "min-h-12 min-w-12 sm:min-h-10 sm:min-w-10 shrink-0 rounded-xl border border-[var(--border-strong)] bg-surface text-foreground hover:bg-button-hover",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          bouncing && "animate-heart-bounce",
          saved ? "fill-[var(--status-danger)] text-[var(--status-danger)]" : "text-muted-foreground"
        )}
      />
      {showLabel && (
        <span>{saved ? "Đã lưu yêu thích" : "Lưu vào yêu thích"}</span>
      )}
    </button>
  );
};
