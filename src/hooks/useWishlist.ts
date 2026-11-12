import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GUEST_WISHLIST_KEY = "salemylink_guest_wishlist";
const WISHLIST_EVENT = "salemylink:wishlist-change";

function readGuestWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch {
    // Ignore quota/storage restrictions
  }
}

function broadcastWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string[]>(WISHLIST_EVENT, { detail: ids }));
}

export const useWishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setProductIds(readGuestWishlist());
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching wishlist:", error);
      setProductIds(readGuestWishlist());
    } else {
      const dbIds = (data || []).map((row) => row.product_id);
      setProductIds(dbIds);
    }
    setLoading(false);
  }, [authLoading, user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onChange = (e: Event) => {
      const custom = e as CustomEvent<string[]>;
      if (Array.isArray(custom.detail)) {
        setProductIds(custom.detail);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_WISHLIST_KEY && !user) {
        setProductIds(readGuestWishlist());
      }
    };
    window.addEventListener(WISHLIST_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [user]);

  const isSaved = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const toggle = useCallback(
    async (productId: string) => {
      const saved = productIds.includes(productId);
      const nextIds = saved
        ? productIds.filter((id) => id !== productId)
        : [productId, ...productIds];

      setProductIds(nextIds);
      broadcastWishlist(nextIds);

      if (!user) {
        writeGuestWishlist(nextIds);
        toast({
          title: saved ? "Đã bỏ lưu" : "Đã lưu vào yêu thích",
          description: saved
            ? "Đã gỡ sản phẩm khỏi danh sách trên trình duyệt."
            : "Đã lưu tạm trên trình duyệt này. Đăng nhập để đồng bộ nhiều thiết bị.",
        });
        return;
      }

      const { error } = saved
        ? await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId)
        : await supabase
            .from("wishlists")
            .insert({ user_id: user.id, product_id: productId });

      if (error) {
        console.error("Wishlist error:", error);
        setProductIds(productIds);
        broadcastWishlist(productIds);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật danh sách yêu thích",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: saved ? "Đã bỏ lưu" : "Đã lưu sản phẩm",
        description: saved
          ? "Sản phẩm đã được gỡ khỏi danh sách yêu thích"
          : "Xem lại trong mục Yêu thích bất cứ lúc nào",
      });
    },
    [productIds, toast, user]
  );

  return {
    productIds,
    loading,
    isSaved,
    toggle,
    refetch: fetchWishlist,
    count: productIds.length,
  };
};
