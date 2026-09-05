import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search, LogOut, Heart } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useNavigate } from '@/lib/router-compat';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useUserRole } from '@/hooks/useUserRole';
import { NotificationBell } from '@/components/NotificationBell';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
  const { count: wishlistCount } = useWishlist();
  const { isSeller, isAdmin } = useUserRole();
  const { t } = useLanguage();
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
          <Link to="/" className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity">
            <img
              src="/logo.png"
              alt="Salemylink Logo"
              width={34}
              height={34}
              className="w-[34px] h-[34px] rounded-xl shadow-sm object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Salemylink.com
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                aria-label={t("nav.searchPlaceholder")}
                placeholder={t("nav.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-smooth"
              />
            </div>
          </form>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher */}
            <LanguageSwitcher variant="header" />

            {user && <NotificationBell />}

            <Link to="/wishlist">
              <Button
                variant="ghost"
                size="sm"
                className="relative hidden sm:flex"
                aria-label={t("nav.wishlist")}
              >
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="sm" className="hidden sm:flex relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="ml-2">{t("nav.cart")}</span>
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
                  <Button variant="outline" size="sm" aria-label={t("nav.account")}>
                    <User className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">
                      {profile?.full_name || t("nav.account")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || t("nav.account")}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    {t("nav.accountManage")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {t("nav.myOrders")}
                  </DropdownMenuItem>
                  {isSeller && (
                    <Link to="/seller-dashboard">
                      <DropdownMenuItem>
                        {t("nav.sellerDashboard")}
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin">
                      <DropdownMenuItem>
                        {t("nav.admin")}
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" aria-label={t("nav.login")}>
                  <User className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">{t("nav.login")}</span>
                </Button>
              </Link>
            )}
            
            <Link to="/seller-signup">
              <Button variant="hero" size="sm">
                {t("nav.sellerAuth")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};