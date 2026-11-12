import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus, Users, Loader2 } from "lucide-react";
import { useFollowSeller } from "@/hooks/useFollowSeller";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  sellerId: string;
  showCount?: boolean;
  size?: "sm" | "default" | "lg";
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const FollowButton = ({
  sellerId,
  showCount = true,
  size = "default",
  compact = false,
  fullWidth = false,
  className,
}: FollowButtonProps) => {
  const { isFollowing, followerCount, loading, toggleFollow } = useFollowSeller(sellerId);

  return (
    <div
      className={cn(
        fullWidth ? "flex w-full flex-col items-stretch gap-2" : "flex flex-wrap items-center gap-3",
        className
      )}
    >
      <Button
        type="button"
        variant={isFollowing ? "outline" : "default"}
        size={size}
        onClick={(e) => {
          e.stopPropagation();
          toggleFollow();
        }}
        disabled={loading}
        aria-pressed={isFollowing}
        className={cn(
          compact
            ? "min-h-10 sm:min-h-9 px-3 text-xs whitespace-nowrap shrink-0"
            : "min-h-12 sm:min-h-11 min-w-[130px]",
          fullWidth && "w-full"
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserCheck className="h-3.5 w-3.5 shrink-0" />
            <span>{compact ? "Đang theo dõi" : "Đang theo dõi người bán"}</span>
          </>
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5 shrink-0" />
            <span>{compact ? "Theo dõi" : "Theo dõi người bán"}</span>
          </>
        )}
      </Button>

      {showCount && (
        <span
          className={cn(
            "flex items-center gap-1 text-xs sm:text-sm text-muted-foreground tabular-nums",
            fullWidth && "justify-center"
          )}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span>{followerCount} người theo dõi</span>
        </span>
      )}
    </div>
  );
};
