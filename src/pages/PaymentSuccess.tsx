import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { toast } = useToast();

  const orderCode = searchParams.get('orderCode');
  const code = searchParams.get('code');
  const status = searchParams.get('status');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderCode) {
        setPaymentStatus('failed');
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('payos-verify-payment', {
          body: {},
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Alternative: direct API call with query params
        const supabaseUrl = 'https://dfalphamyvdfewixrnju.supabase.co';
        const response = await fetch(`${supabaseUrl}/functions/v1/payos-verify-payment?orderCode=${orderCode}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();

        if (result.success) {
          if (result.status === 'PAID') {
            setPaymentStatus('success');
            
            // Get order details
            const { data: orders } = await supabase
              .from('orders')
              .select(`
                *,
                products(*),
                payments(*)
              `)
              .eq('order_number', `ORD${orderCode}`)
              .single();

            setOrderDetails(orders);
          } else {
            setPaymentStatus('failed');
          }
        } else {
          setPaymentStatus('failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('failed');
        toast({
          title: "Lỗi xác thực",
          description: "Không thể xác thực trạng thái thanh toán.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [orderCode, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Thanh toán thành công"
        description="Thanh toán của bạn đã được xử lý thành công. Cảm ơn bạn đã mua hàng tại Salemylink.com."
        url="https://salemylink.com/payment/success"
        noindex={true}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {verifying ? (
            <Card className="text-center py-12">
              <CardContent>
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold mb-2">Đang xác thực thanh toán</h2>
                <p className="text-muted-foreground">
                  Vui lòng chờ trong giây lát...
                </p>
              </CardContent>
            </Card>
          ) : paymentStatus === 'success' ? (
            <div className="space-y-6">
              <Card className="text-center py-8">
                <CardContent>
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-green-700 mb-2">
                    Thanh toán thành công!
                  </h1>
                  <p className="text-muted-foreground">
                    Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.
                  </p>
                </CardContent>
              </Card>

              {orderDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Mã đơn hàng:</p>
                        <p className="text-muted-foreground">{orderDetails.order_number}</p>
                      </div>
                      <div>
                        <p className="font-medium">Tổng tiền:</p>
                        <p className="text-muted-foreground">{formatPrice(orderDetails.total_amount)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Sản phẩm:</p>
                        <p className="text-muted-foreground">{orderDetails.products?.title}</p>
                      </div>
                      <div>
                        <p className="font-medium">Trạng thái:</p>
                        <p className="text-green-600 font-medium">Đã thanh toán</p>
                      </div>
                    </div>

                    {orderDetails.download_link && (
                      <div className="pt-4 border-t">
                        <Button asChild className="w-full">
                          <a href={orderDetails.download_link} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Tải xuống sản phẩm
                          </a>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Link tải sẽ hết hạn sau 7 ngày
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tiếp tục mua sắm
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/orders">
                    Xem đơn hàng
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">✕</span>
                </div>
                <h1 className="text-2xl font-bold text-red-700 mb-2">
                  Thanh toán thất bại
                </h1>
                <p className="text-muted-foreground mb-6">
                  Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild variant="outline">
                    <Link to="/cart">
                      Quay về giỏ hàng
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/">
                      Về trang chủ
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};