import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { SEO } from '@/components/SEO';

export const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Thanh toán đã hủy"
        description="Bạn đã hủy quá trình thanh toán. Sản phẩm vẫn được lưu trong giỏ hàng."
        url="https://salemylink.com/payment/cancel"
        noindex={true}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 text-2xl">⚠</span>
              </div>
              <h1 className="text-2xl font-bold text-yellow-700 mb-2">
                Thanh toán đã bị hủy
              </h1>
              <p className="text-muted-foreground mb-6">
                Bạn đã hủy quá trình thanh toán. Sản phẩm vẫn được lưu trong giỏ hàng.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link to="/cart">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Quay về giỏ hàng
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Về trang chủ
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};