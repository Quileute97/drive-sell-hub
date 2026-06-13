import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useUserRole } from '@/hooks/useUserRole';
import { NotificationBell } from '@/components/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const { isSeller, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <span className="text-white font-bold text-sm">SL</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Salemylink.com
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                aria-label="Tìm kiếm sản phẩm digital"
                placeholder="Tìm kiếm sản phẩm digital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
              />
            </div>
          </form>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && <NotificationBell />}
            
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="hidden sm:flex relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="ml-2">Giỏ hàng</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Tài khoản">
                    <User className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">
                      {profile?.full_name || 'Tài khoản'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'Người dùng'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Quản lý tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Đơn hàng của tôi
                  </DropdownMenuItem>
                  {isSeller && (
                    <Link to="/seller-dashboard">
                      <DropdownMenuItem>
                        Dashboard bán hàng
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin">
                      <DropdownMenuItem>
                        Quản trị hệ thống
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Đăng nhập</span>
                </Button>
              </Link>
            )}
            
            <Link to="/seller-signup">
              <Button variant="hero" size="sm">
                Đăng ký bán hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};