import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFollowSeller = (sellerId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchFollowStatus = useCallback(async () => {
    if (!sellerId) return;

    try {
      // Get follower count
      const { count } = await supabase
        .from('seller_followers')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId);
      
      setFollowerCount(count || 0);

      // Check if current user is following
      if (user) {
        const { data } = await supabase
          .from('seller_followers')
          .select('id')
          .eq('seller_id', sellerId)
          .eq('follower_id', user.id)
          .maybeSingle();
        
        setIsFollowing(!!data);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  }, [sellerId, user]);

  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để theo dõi người bán.",
        variant: "destructive"
      });
      return;
    }

    if (!sellerId) return;

    if (user.id === sellerId) {
      toast({
        title: "Không thể theo dõi",
        description: "Bạn không thể tự theo dõi chính mình.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('seller_followers')
          .delete()
          .eq('seller_id', sellerId)
          .eq('follower_id', user.id);

        if (error) throw error;
        
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Đã bỏ theo dõi",
          description: "Bạn sẽ không nhận thông báo từ người bán này nữa."
        });
      } else {
        const { error } = await supabase
          .from('seller_followers')
          .insert({
            seller_id: sellerId,
            follower_id: user.id
          });

        if (error) throw error;
        
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({
          title: "Đã theo dõi",
          description: "Bạn sẽ nhận thông báo khi có sản phẩm mới."
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thực hiện thao tác này.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, followerCount, loading, toggleFollow };
};
