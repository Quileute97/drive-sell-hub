import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShoppingCart,
  User,
  Search,
  LogOut,
  Heart,
  Menu,
  X,
  TrendingUp,
  ArrowUpRight,
  Store,
  BookOpen,
  Compass,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useNavigate } from "@/lib/router-compat";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { POPULAR_SEARCH_KEYWORDS } from "@/lib/productQuery";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isSeller, isAdmin } = useUserRole();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return POPULAR_SEARCH_KEYWORDS;
    return POPULAR_SEARCH_KEYWORDS.filter((kw) =>
      kw.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    setShowSuggestions(false);
    setActiveIndex(-1);
    setMobileMenuOpen(false);
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/search");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
      const picked = filteredSuggestions[activeIndex];
      setSearchQuery(picked);
      submitSearch(picked);
      return;
    }
    submitSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        filteredSuggestions.length === 0
          ? -1
          : prev < filteredSuggestions.length - 1
            ? prev + 1
            : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        filteredSuggestions.length === 0
          ? -1
          : prev > 0
            ? prev - 1
            : filteredSuggestions.length - 1
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-1.5 min-[375px]:gap-2 sm:gap-3 px-3 min-[375px]:px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Drawer Trigger + Brand + Inline Nav */}
        <div className="flex items-center gap-1.5 min-[375px]:gap-2 sm:gap-3 shrink-0">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden h-12 w-10 min-[375px]:w-11 sm:h-10 sm:w-10 shrink-0"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[340px] flex flex-col p-0">
              <SheetHeader className="border-b border-border px-4 py-3">
                <SheetTitle className="flex items-center gap-2.5 text-left">
                  <img
                    src="/logo.png"
                    alt="Salemylink"
                    width={30}
                    height={30}
                    className="size-[30px] rounded-lg object-contain"
                  />
                  <span className="text-base font-bold tracking-tight text-primary">
                    Salemylink
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {/* Mobile drawer search */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitSearch(searchQuery);
                  }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("nav.searchPlaceholder")}
                      className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCH_KEYWORDS.slice(0, 4).map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => {
                          setSearchQuery(kw);
                          submitSearch(kw);
                        }}
                        className="rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-button-hover"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </form>

                {/* Primary links */}
                <nav className="space-y-1" aria-label="Menu di động">
                  <Link
                    to="/search"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Compass className="h-4 w-4 text-primary" />
                    <span>Khám phá tài liệu</span>
                  </Link>
                  <Link
                    to="/nguoi-ban"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Store className="h-4 w-4 text-primary" />
                    <span>{t("nav.sellers")}</span>
                  </Link>
                  <Link
                    to="/huong-dan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{t("nav.guides")}</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="h-4 w-4 text-accent" />
                      <span>{t("nav.wishlist")}</span>
                    </span>
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <span>{t("nav.cart")}</span>
                    </span>
                    {totalItems > 0 && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground tabular-nums">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                  <a
                    href="https://t.me/+2ZkLgrmVJgBkMGM1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
                  >
                    <TelegramIcon className="h-4 w-4" />
                    <span>Group Telegram cộng đồng</span>
                  </a>
                </nav>

                {/* Role links */}
                {(isSeller || isAdmin) && (
                  <div className="border-t border-border pt-3 space-y-1">
                    {isSeller && (
                      <Link
                        to="/seller-dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        <span>{t("nav.sellerDashboard")}</span>
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <Shield className="h-4 w-4 text-primary" />
                        <span>{t("nav.admin")}</span>
                      </Link>
                    )}
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("footer.language")}
                  </p>
                  <LanguageSwitcher variant="footer" />
                </div>
              </div>

              <div className="border-t border-border p-3.5 space-y-2 bg-surface">
                <Button variant="default" className="w-full h-11" asChild>
                  <Link to="/seller-signup" onClick={() => setMobileMenuOpen(false)}>
                    {t("nav.sellerAuth")}
                  </Link>
                </Button>
                {!user && (
                  <Button variant="outline" className="w-full h-11" asChild>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      {t("nav.login")}
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            to="/"
            className="flex min-h-9 items-center gap-1.5 min-[375px]:gap-2 py-1 hover:opacity-90 transition-opacity shrink-0"
          >
            <img
              src="/logo.png"
              alt="Salemylink"
              width={32}
              height={32}
              className="size-7 min-[375px]:size-8 rounded-lg object-contain"
            />
            <span className="text-base min-[375px]:text-lg font-bold tracking-tight text-primary">
              Salemylink
            </span>
          </Link>

          {/* Desktop Quick Nav */}
          <nav
            className="hidden lg:flex items-center gap-0.5 ml-1"
            aria-label="Điều hướng chính"
          >
            <Link
              to="/search"
              className="inline-flex h-10 items-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap"
            >
              Khám phá
            </Link>
            <Link
              to="/nguoi-ban"
              className="inline-flex h-10 items-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t("nav.sellers")}
            </Link>
            <Link
              to="/huong-dan"
              className="hidden 2xl:inline-flex h-10 items-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t("nav.guides")}
            </Link>
          </nav>
        </div>

        {/* Center: Desktop Search Bar + Popular Keywords Autocomplete */}
        <div
          ref={searchContainerRef}
          className="relative hidden lg:block flex-1 max-w-md mx-2 min-w-0"
        >
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-autocomplete="list"
              aria-label={t("nav.searchPlaceholder")}
              placeholder={t("nav.searchPlaceholder")}
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setActiveIndex(-1);
              }}
              className={`h-10 w-full rounded-xl border border-border-strong bg-muted/40 pl-9 text-sm text-foreground placeholder:text-muted-foreground outline-hidden focus:bg-surface focus:border-primary focus:ring-2 focus:ring-ring/20 transition-colors ${searchQuery ? "pr-9" : "pr-3"}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveIndex(-1);
                }}
                aria-label="Xoá từ khóa tìm kiếm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Popular Keywords Autocomplete Popover */}
          {showSuggestions && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-popover)] animate-[popIn_140ms_ease-out]"
            >
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => submitSearch(searchQuery)}
                  className="mb-1 flex w-full items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-left text-sm font-medium text-primary hover:bg-muted"
                >
                  <span className="truncate">
                    Tìm kiếm "{searchQuery.trim()}"
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </button>
              )}

              <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
                <span>Từ khóa phổ biến</span>
              </div>

              {filteredSuggestions.length > 0 ? (
                <div className="space-y-0.5">
                  {filteredSuggestions.map((keyword, idx) => {
                    const isHighlighted = idx === activeIndex;
                    return (
                      <button
                        key={keyword}
                        type="button"
                        role="option"
                        aria-selected={isHighlighted}
                        onClick={() => {
                          setSearchQuery(keyword);
                          submitSearch(keyword);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                          isHighlighted
                            ? "bg-muted text-primary font-medium"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0 truncate">
                          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{keyword}</span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Nhấn Enter để tìm kiếm "{searchQuery.trim()}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 min-[375px]:gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Shortcut (<lg) */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden h-12 w-10 min-[375px]:w-11 sm:h-10 sm:w-10"
            asChild
          >
            <Link to="/search" aria-label={t("nav.search")}>
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher variant="header" />
          </div>

          {user && <NotificationBell />}

          {/* Wishlist */}
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:inline-flex relative h-10 w-10"
            asChild
          >
            <Link to="/wishlist" aria-label={t("nav.wishlist")}>
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Cart */}
          <Button
            variant="outline"
            size="icon"
            className="relative h-12 w-10 min-[375px]:w-11 sm:h-10 sm:w-10"
            asChild
          >
            <Link
              to="/cart"
              aria-label={`${t("nav.cart")}${totalItems > 0 ? ` (${totalItems})` : ""}`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">{t("nav.cart")}</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          {/* Account or Login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="h-12 w-10 min-[375px]:w-11 md:w-auto lg:w-10 xl:w-auto sm:h-10 px-0 md:px-3 lg:px-0 xl:px-3 gap-1.5"
                  aria-label={t("nav.account")}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline lg:hidden xl:inline max-w-[110px] truncate">
                    {profile?.full_name || t("nav.account")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {profile?.full_name || t("nav.account")}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/wishlist">
                    <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t("nav.wishlist")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cart">
                    <ShoppingCart className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t("nav.cart")}
                  </Link>
                </DropdownMenuItem>
                {isSeller && (
                  <DropdownMenuItem asChild>
                    <Link to="/seller-dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2 text-muted-foreground" />
                      {t("nav.sellerDashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                      {t("nav.admin")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="default"
              className="h-12 w-10 min-[375px]:w-11 md:w-auto lg:w-10 xl:w-auto sm:h-10 px-0 md:px-3 lg:px-0 xl:px-3 gap-1.5"
              asChild
            >
              <Link to="/auth" aria-label={t("nav.login")}>
                <User className="h-4 w-4" />
                <span className="hidden md:inline lg:hidden xl:inline">{t("nav.login")}</span>
              </Link>
            </Button>
          )}

          {/* Seller CTA */}
          <Button
            variant="default"
            size="default"
            className="hidden sm:inline-flex h-10 px-3 lg:px-3 xl:px-4 whitespace-nowrap"
            asChild
          >
            <Link to="/seller-signup">
              <span className="hidden xl:inline">{t("nav.sellerAuth")}</span>
              <span className="xl:hidden">Đăng bán</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
