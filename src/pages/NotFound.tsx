import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, BookOpen, ShoppingBag, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const popularPages = [
    { title: "Tìm kiếm sản phẩm Digital", href: "/search", icon: Search, description: "Khám phá hàng ngàn sản phẩm digital chất lượng" },
    { title: "Danh sách người bán", href: "/sellers", icon: ShoppingBag, description: "Xem các seller uy tín trên Salemylink" },
    { title: "Hướng dẫn mua hàng", href: "/how-it-works", icon: BookOpen, description: "Tìm hiểu cách mua và bán sản phẩm" },
    { title: "Câu hỏi thường gặp", href: "/about", icon: HelpCircle, description: "Tìm hiểu thêm về Salemylink.com" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Trang không tìm thấy - Lỗi 404"
        description="Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển. Khám phá các trang phổ biến hoặc tìm kiếm sản phẩm digital trên Salemylink.com."
        url={`https://salemylink.com${location.pathname}`}
        noindex={true}
      />
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Không tìm thấy trang</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. 
              Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Về trang chủ
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Tìm kiếm sản phẩm
                </Link>
              </Button>
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </div>
          </div>

          {/* Popular pages section for better internal linking */}
          <section className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-center mb-6">Bạn có thể quan tâm</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {popularPages.map((page) => (
                <Link key={page.href} to={page.href}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <page.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{page.title}</h4>
                        <p className="text-sm text-muted-foreground">{page.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
