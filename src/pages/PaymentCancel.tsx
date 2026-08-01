import { Link } from '@/lib/router-compat';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Home, Search, HelpCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';

export const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Thanh toán đã hủy - Quay lại giỏ hàng"
        description="Bạn đã hủy quá trình thanh toán. Sản phẩm vẫn được lưu trong giỏ hàng. Bạn có thể thanh toán lại bất cứ lúc nào trên Salemylink.com."
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
              <div className="flex gap-4 justify-center mb-8">
                <Button asChild variant="outline">
                  <Link to="/cart">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Quay về giỏ hàng
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Về trang chủ
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional helpful content */}
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-center">Cần hỗ trợ?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/how-it-works">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Hướng dẫn thanh toán</p>
                      <p className="text-xs text-muted-foreground">Tìm hiểu quy trình mua hàng</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/search">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Search className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Tiếp tục khám phá</p>
                      <p className="text-xs text-muted-foreground">Tìm kiếm thêm sản phẩm digital</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
