import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setProductIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching wishlist:', error);
    } else {
      setProductIds((data || []).map((row) => row.product_id));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isSaved = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        toast({
          title: 'Cần đăng nhập',
          description: 'Đăng nhập để lưu sản phẩm vào danh sách yêu thích',
          variant: 'destructive',
        });
        return;
      }

      const saved = productIds.includes(productId);
      // optimistic update
      setProductIds((prev) =>
        saved ? prev.filter((id) => id !== productId) : [...prev, productId]
      );

      const { error } = saved
        ? await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId)
        : await supabase
            .from('wishlists')
            .insert({ user_id: user.id, product_id: productId });

      if (error) {
        console.error('Wishlist error:', error);
        setProductIds((prev) =>
          saved ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
        toast({
          title: 'Lỗi',
          description: 'Không thể cập nhật danh sách yêu thích',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: saved ? 'Đã bỏ lưu' : 'Đã lưu sản phẩm',
        description: saved
          ? 'Sản phẩm đã được gỡ khỏi danh sách yêu thích'
          : 'Xem lại trong mục Yêu thích bất cứ lúc nào',
      });
    },
    [productIds, toast, user]
  );

  return { productIds, loading, isSaved, toggle, refetch: fetchWishlist, count: productIds.length };
};
