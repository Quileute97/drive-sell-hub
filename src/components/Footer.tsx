import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";

export const Footer = () => {
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order')
        .limit(5);
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <footer className="bg-card border-t" role="contentinfo">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity inline-flex">
              <img
                src="/logo.png"
                alt="Salemylink Logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl shadow-sm object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Salemylink.com
              </span>
            </Link>
            <p className="text-muted-foreground">
              Nền tảng thương mại điện tử hàng đầu cho sản phẩm digital tại Việt Nam.
              Kết nối người mua và người bán một cách an toàn, nhanh chóng.
            </p>
            <nav className="flex space-x-4" aria-label="Social media links">
              <Button variant="ghost" size="icon" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Youtube">
                <Youtube className="h-5 w-5" />
              </Button>
            </nav>
          </div>

          {/* Quick Links */}
          <nav className="space-y-4" aria-labelledby="footer-links-heading">
            <h3 id="footer-links-heading" className="text-lg font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Cách thức hoạt động</Link></li>
              <li><Link to="/huong-dan" className="text-muted-foreground hover:text-primary transition-colors">Cẩm nang & Hướng dẫn</Link></li>
              <li><Link to="/seller-guide" className="text-muted-foreground hover:text-primary transition-colors">Hướng dẫn bán hàng</Link></li>
              <li><Link to="/affiliate" className="text-muted-foreground hover:text-primary transition-colors">Affiliate - Kiếm 5% hoa hồng</Link></li>
              <li><Link to="/nguoi-ban" className="text-muted-foreground hover:text-primary transition-colors">Top Người bán uy tín</Link></li>
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">Điều khoản sử dụng</Link></li>
            </ul>
          </nav>

          {/* Categories */}
          <nav className="space-y-4" aria-labelledby="footer-categories-heading">
            <h3 id="footer-categories-heading" className="text-lg font-semibold">Danh mục nổi bật</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link to={`/danh-muc/${category.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <>
                  <li><Link to="/danh-muc/tai-lieu-hoc-tap" className="text-muted-foreground hover:text-primary transition-colors">Tài liệu học tập</Link></li>
                  <li><Link to="/danh-muc/khoa-hoc-online" className="text-muted-foreground hover:text-primary transition-colors">Khóa học Online</Link></li>
                  <li><Link to="/danh-muc/template-design" className="text-muted-foreground hover:text-primary transition-colors">Template & Design</Link></li>
                </>
              )}
            </ul>
          </nav>

          {/* Contact */}
          <address className="space-y-4 not-italic">
            <h3 className="text-lg font-semibold">Liên hệ & Hỗ trợ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">support@salemylink.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">1900-xxxx</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Hà Nội, Việt Nam</span>
              </div>
            </div>
          </address>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Salemylink.com. Nền tảng chia sẻ và mua bán sản phẩm digital hàng đầu Việt Nam.</p>
        </div>
      </div>
    </footer>
  );
};