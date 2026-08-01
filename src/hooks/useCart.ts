import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    thumbnail_url?: string;
    category?: {
      name: string;
    };
    profiles?: {
      full_name: string;
    };
  };
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            id,
            title,
            price,
            thumbnail_url,
            category:categories(name),
            profiles(full_name)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems((data || []) as CartItem[]);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải giỏ hàng",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Cần đăng nhập",
          description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .upsert(
          { 
            user_id: user.id, 
            product_id: productId, 
            quantity 
          },
          { 
            onConflict: 'user_id,product_id',
            ignoreDuplicates: false 
          }
        );

      if (error) throw error;

      toast({
        title: "Đã thêm vào giỏ hàng",
        description: "Sản phẩm đã được thêm vào giỏ hàng thành công"
      });

      fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm sản phẩm vào giỏ hàng",
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật số lượng",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      toast({
        title: "Đã xóa sản phẩm",
        description: "Sản phẩm đã được xóa khỏi giỏ hàng",
      });

      fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Lỗi", 
        description: "Không thể xóa sản phẩm",
        variant: "destructive"
      });
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const totalAmount = cartItems.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  );

  const totalItems = cartItems.reduce((total, item) => 
    total + item.quantity, 0
  );

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    totalItems,
    refetch: fetchCartItems
  };
};