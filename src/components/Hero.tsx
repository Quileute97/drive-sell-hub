import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Download, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-digital-marketplace.jpg";

export const Hero = () => {
  const [stats, setStats] = useState({
    sellers: 0,
    products: 0,
    downloads: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get sellers count
      const { count: sellersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');

      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total downloads from products
      const { data: productsData } = await supabase
        .from('products')
        .select('download_count')
        .eq('status', 'active');

      const totalDownloads = productsData?.reduce((sum, product) => sum + (product.download_count || 0), 0) || 0;

      setStats({
        sellers: sellersCount || 0,
        products: productsCount || 0,
        downloads: totalDownloads
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <section className="relative overflow-hidden gradient-subtle py-20 lg:py-32" aria-label="Hero section">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Nền tảng bán 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}sản phẩm Digital{" "}
              </span>
              hàng đầu Việt Nam
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Kết nối người mua và người bán sản phẩm số. Bán tài liệu, khóa học, 
              ebook và nhiều sản phẩm digital khác một cách dễ dàng qua Google Drive.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button variant="hero" size="lg" className="group">
                Bắt đầu bán ngay
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-5 w-5" />
                Xem demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 text-center lg:text-left">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.sellers.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Người bán</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stats.products.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Sản phẩm</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stats.downloads.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Lượt tải</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-float">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img 
                src={heroImage} 
                alt="Nền tảng thương mại điện tử bán sản phẩm digital - Kết nối người mua và người bán tài liệu, ebook, khóa học online qua Google Drive"
                className="w-full h-auto"
                loading="eager"
                width="800"
                height="600"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-card rounded-lg p-4 shadow-accent animate-bounce delay-100">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Tải ngay</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card rounded-lg p-4 shadow-primary animate-bounce delay-300">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">+999 đánh giá</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};