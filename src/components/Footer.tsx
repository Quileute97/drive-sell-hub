import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <span className="text-white font-bold text-sm">SL</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Salemylink.com
              </span>
            </div>
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
              <li><a href="/about" className="text-muted-foreground hover:text-primary transition-colors">Về chúng tôi</a></li>
              <li><a href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Cách thức hoạt động</a></li>
              <li><a href="/seller-guide" className="text-muted-foreground hover:text-primary transition-colors">Hướng dẫn bán hàng</a></li>
              <li><a href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Chính sách bảo mật</a></li>
              <li><a href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="/admin/login" className="text-muted-foreground hover:text-primary transition-colors">Đăng nhập Admin</a></li>
            </ul>
          </nav>

          {/* Categories */}
          <nav className="space-y-4" aria-labelledby="footer-categories-heading">
            <h3 id="footer-categories-heading" className="text-lg font-semibold">Danh mục</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <a href={`/category/${category.id}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {category.name}
                  </a>
                </li>
              ))}
              {categories.length === 0 && (
                <>
                  <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Ebook & Tài liệu</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Khóa học Online</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Template & Design</a></li>
                </>
              )}
            </ul>
          </nav>

          {/* Contact */}
          <address className="space-y-4 not-italic">
            <h3 className="text-lg font-semibold">Liên hệ</h3>
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

        <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Salemylink.com. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};