import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Trang không tìm thấy - 404"
        description="Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển. Vui lòng quay về trang chủ Salemylink.com."
        url={`https://salemylink.com${location.pathname}`}
        noindex={true}
      />
      <Header />
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center px-4 py-16">
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
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
