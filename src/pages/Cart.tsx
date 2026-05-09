import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { SEO } from '@/components/SEO';

export const Cart = () => {
  const { 
    cartItems, 
    loading, 
    updateQuantity, 
    removeItem, 
    totalAmount, 
    totalItems,
    refetch
  } = useCart();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCheckout = async () => {
    console.log('=== Checkout button clicked ===');
    console.log('Cart items:', cartItems);
    
    if (cartItems.length === 0) {
      console.log('Cart is empty');
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('User session:', session);
    console.log('Auth error:', authError);

    if (!session?.user) {
      console.log('User not authenticated');
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để thực hiện thanh toán.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      console.log('Calling payos-create-payment function...');
      
      const { getAffiliateRefCode } = await import("@/lib/affiliate");
      const affiliateCode = getAffiliateRefCode();

      const { data, error } = await supabase.functions.invoke('payos-create-payment', {
        body: {
          cartItems: cartItems,
          affiliateCode
        }
      });

      console.log('Function response data:', data);
      console.log('Function response error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success && data?.paymentUrl) {
        console.log('Payment URL received:', data.paymentUrl);
        
        // Clear cart locally since it's cleared on server
        refetch();
        
        // Redirect to PayOS payment page
        window.location.href = data.paymentUrl;
      } else {
        console.error('Invalid response from payment function:', data);
        throw new Error('Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: `Không thể tạo thanh toán: ${error.message || 'Vui lòng thử lại sau.'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Giỏ hàng"
        description="Giỏ hàng của bạn trên Salemylink.com. Xem lại sản phẩm digital đã chọn và tiến hành thanh toán."
        url="https://salemylink.com/cart"
        noindex={true}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Giỏ hàng của bạn</h1>
          <p className="text-muted-foreground">
            Bạn có {totalItems} sản phẩm trong giỏ hàng
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Giỏ hàng trống</h3>
              <p className="text-muted-foreground mb-4">
                Hãy khám phá các sản phẩm digital tuyệt vời của chúng tôi
              </p>
              <Button asChild>
                <a href="/">Tiếp tục mua sắm</a>
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải giỏ hàng...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {item.product.thumbnail_url ? (
                          <img 
                            src={item.product.thumbnail_url} 
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.product.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Người bán: {item.product.profiles?.full_name || 'Không xác định'}
                            </p>
                            <Badge variant="secondary" className="mt-1">
                              {item.product.category?.name || 'Không phân loại'}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3 py-1 border rounded-md text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.product.price)} x {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Tạm tính ({totalItems} sản phẩm)</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí xử lý</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessingPayment || cartItems.length === 0}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Thanh toán với PayOS'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};