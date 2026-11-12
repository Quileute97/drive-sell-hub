import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GUEST_FOLLOWS_KEY = "salemylink_guest_follows";
const FOLLOW_EVENT = "salemylink:follow-change";

function readGuestFollows(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_FOLLOWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [];
  } catch {
    return [];
  }
}

function writeGuestFollows(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_FOLLOWS_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
}

export const useFollowSeller = (sellerId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchFollowStatus = useCallback(async () => {
    if (!sellerId) return;

    try {
      const { count } = await supabase
        .from("seller_followers")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId);

      const baseCount = count || 0;

      if (user) {
        const { data } = await supabase
          .from("seller_followers")
          .select("id")
          .eq("seller_id", sellerId)
          .eq("follower_id", user.id)
          .maybeSingle();

        setIsFollowing(!!data);
        setFollowerCount(baseCount);
      } else {
        const guestFollows = readGuestFollows();
        const followingGuest = guestFollows.includes(sellerId);
        setIsFollowing(followingGuest);
        setFollowerCount(baseCount + (followingGuest ? 1 : 0));
      }
    } catch (error) {
      console.error("Error fetching follow status:", error);
    }
  }, [sellerId, user]);

  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  useEffect(() => {
    if (typeof window === "undefined" || !sellerId) return;
    const onFollowChange = (e: Event) => {
      const detail = (e as CustomEvent<{ sellerId: string; isFollowing: boolean; delta: number }>).detail;
      if (detail && detail.sellerId === sellerId) {
        setIsFollowing(detail.isFollowing);
        setFollowerCount((prev) => Math.max(0, prev + detail.delta));
      }
    };
    window.addEventListener(FOLLOW_EVENT, onFollowChange);
    return () => window.removeEventListener(FOLLOW_EVENT, onFollowChange);
  }, [sellerId]);

  const toggleFollow = async () => {
    if (!sellerId) return;

    if (!user) {
      const current = readGuestFollows();
      const alreadyFollowing = current.includes(sellerId);
      const next = alreadyFollowing
        ? current.filter((id) => id !== sellerId)
        : [sellerId, ...current];
      writeGuestFollows(next);
      window.dispatchEvent(
        new CustomEvent(FOLLOW_EVENT, {
          detail: {
            sellerId,
            isFollowing: !alreadyFollowing,
            delta: alreadyFollowing ? -1 : 1,
          },
        })
      );
      toast({
        title: alreadyFollowing ? "Đã bỏ theo dõi" : "Đã theo dõi người bán",
        description: alreadyFollowing
          ? "Đã gỡ khỏi danh sách theo dõi trên trình duyệt."
          : "Đã lưu theo dõi trên trình duyệt. Đăng nhập để nhận thông báo khi có tài liệu mới.",
      });
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: "Không thể theo dõi",
        description: "Bạn không thể tự theo dõi chính mình.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("seller_followers")
          .delete()
          .eq("seller_id", sellerId)
          .eq("follower_id", user.id);

        if (error) throw error;

        window.dispatchEvent(
          new CustomEvent(FOLLOW_EVENT, {
            detail: { sellerId, isFollowing: false, delta: -1 },
          })
        );
        toast({
          title: "Đã bỏ theo dõi",
          description: "Bạn sẽ không nhận thông báo từ người bán này nữa.",
        });
      } else {
        const { error } = await supabase.from("seller_followers").insert({
          seller_id: sellerId,
          follower_id: user.id,
        });

        if (error) throw error;

        window.dispatchEvent(
          new CustomEvent(FOLLOW_EVENT, {
            detail: { sellerId, isFollowing: true, delta: 1 },
          })
        );
        toast({
          title: "Đã theo dõi",
          description: "Bạn sẽ nhận thông báo khi có sản phẩm mới.",
        });
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thực hiện thao tác này.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, followerCount, loading, toggleFollow };
};
