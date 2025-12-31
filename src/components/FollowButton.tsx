import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Users, Loader2 } from "lucide-react";
import { useFollowSeller } from "@/hooks/useFollowSeller";

interface FollowButtonProps {
  sellerId: string;
  showCount?: boolean;
  size?: "sm" | "default" | "lg";
}

export const FollowButton = ({ sellerId, showCount = true, size = "default" }: FollowButtonProps) => {
  const { isFollowing, followerCount, loading, toggleFollow } = useFollowSeller(sellerId);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isFollowing ? "outline" : "default"}
        size={size}
        onClick={toggleFollow}
        disabled={loading}
        className="min-w-[120px]"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserMinus className="h-4 w-4 mr-2" />
            Bỏ theo dõi
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Theo dõi
          </>
        )}
      </Button>
      
      {showCount && (
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Users className="h-4 w-4" />
          {followerCount} người theo dõi
        </span>
      )}
    </div>
  );
};
