import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <span className="text-white font-bold text-sm">SL</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Salemylink.com
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm digital..."
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <ShoppingCart className="h-4 w-4" />
              <span className="ml-2">Giỏ hàng</span>
            </Button>
            
            <Button variant="outline" size="sm">
              <User className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Đăng nhập</span>
            </Button>
            
            <Button variant="hero" size="sm">
              Đăng ký bán hàng
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};