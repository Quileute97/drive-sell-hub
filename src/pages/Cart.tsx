import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Link } from '@/lib/router-compat';
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
        description: `Không thể tạo thanh toán: ${error instanceof Error ? error.message : 'Vui lòng thử lại sau.'}`,
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
      
      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Giỏ hàng" }]} />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Giỏ hàng của bạn</h1>
          <p className="text-sm text-muted-foreground">
            Bạn có {totalItems} sản phẩm trong giỏ hàng
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 rounded-2xl border border-border bg-surface">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Đang tải giỏ hàng...</span>
          </div>
        ) : cartItems.length === 0 ? (
          <Card className="text-center py-12 rounded-2xl border-border bg-surface">
            <CardContent>
              <ShoppingBag className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Giỏ hàng trống</h2>
              <p className="text-muted-foreground mb-5 text-sm">
                Hãy khám phá các sản phẩm digital tuyệt vời của chúng tôi
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild className="min-h-11 sm:min-h-10">
                  <Link to="/search">Khám phá tài liệu</Link>
                </Button>
                <Button variant="outline" asChild className="min-h-11 sm:min-h-10">
                  <Link to="/">Về trang chủ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="rounded-2xl border-border bg-surface">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3.5 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-muted rounded-xl flex items-center justify-center overflow-hidden border border-border">
                        {item.product.thumbnail_url ? (
                          <img 
                            src={item.product.thumbnail_url} 
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg leading-snug break-words">{item.product.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                              Người bán: {item.product.profiles?.full_name || 'Không xác định'}
                            </p>
                            <Badge variant="secondary" className="mt-1.5 text-xs">
                              {item.product.category?.name || 'Không phân loại'}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Xóa ${item.product.title} khỏi giỏ hàng`}
                            onClick={() => removeItem(item.id)}
                            className="h-10 w-10 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Giảm số lượng"
                              className="h-10 w-10 sm:h-9 sm:w-9"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium tabular-nums min-w-10 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Tăng số lượng"
                              className="h-10 w-10 sm:h-9 sm:w-9"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-base sm:text-lg font-bold text-primary tabular-nums">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                            <p className="text-xs text-muted-foreground tabular-nums">
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