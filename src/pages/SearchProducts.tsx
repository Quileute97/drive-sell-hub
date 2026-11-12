import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import {
  ProductFilterControls,
  type FilterCategoryOption,
} from "@/components/ProductFilterControls";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/States";
import { RelatedCategories } from "@/components/RelatedCategories";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "@/lib/router-compat";
import {
  DEFAULT_PRODUCT_FILTERS,
  LANGUAGE_LABELS,
  MAX_PRICE_SLIDER,
  POPULAR_SEARCH_KEYWORDS,
  formatMoneyVnd,
  parseFiltersFromSearchParams,
  queryFilteredProducts,
  serializeFiltersToSearchParams,
  type ProductFilterState,
  type ProductSortOption,
} from "@/lib/productQuery";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";

const PAGE_SIZE = 12;

export default function SearchProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<FilterCategoryOption[]>([]);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync URL params -> filter state
  const filters = useMemo(
    () => parseFiltersFromSearchParams(searchParams, categories),
    [searchParams, categories]
  );

  const [searchInput, setSearchInput] = useState(filters.q);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Load categories + active counts once
  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const { data } = await supabase
          .from("categories")
          .select("id, name, slug, products(id, status)")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (cancelled) return;
        const formatted: FilterCategoryOption[] = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          product_count: Array.isArray(c.products)
            ? c.products.filter((p: any) => !p.status || p.status === "active").length
            : 0,
        }));
        setCategories(formatted);
      } catch (err) {
        console.error("Error loading filter categories:", err);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryIdsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.slug, c.id);
      map.set(c.id, c.id);
    }
    return map;
  }, [categories]);

  // Fetch filtered products from Supabase
  useEffect(() => {
    // Wait until categories resolve if ?cat= or ?category= is specified
    const hasCatParam = Boolean(
      searchParams.get("cat") || searchParams.get("category")
    );
    if (hasCatParam && categories.length === 0) return;

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await queryFilteredProducts<ProductCardData>({
          filters,
          categoryIdsMap,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        const cleaned = (res.items || []).map((p: any) => ({
          ...p,
          thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
          images: sanitizeImageArray(p.images),
        }));
        setProducts(cleaned);
        setTotalCount(res.totalCount);
      } catch (err) {
        console.error("Error querying filtered products:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [filters, categoryIdsMap, categories.length, searchParams, reloadKey]);

  const updateFilters = (patch: Partial<ProductFilterState>) => {
    const next: ProductFilterState = {
      ...filters,
      ...patch,
    };
    const nextParams = serializeFiltersToSearchParams(next);
    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    updateFilters({ q: searchInput.trim(), page: 1 });
  };

  const filteredSuggestions = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return POPULAR_SEARCH_KEYWORDS;
    return POPULAR_SEARCH_KEYWORDS.filter((kw) => kw.toLowerCase().includes(q));
  }, [searchInput]);

  const activeFilterCount =
    filters.categories.length +
    (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE_SLIDER ? 1 : 0) +
    (filters.hasRating ? 1 : 0) +
    (filters.hasImage ? 1 : 0) +
    (filters.freeOnly ? 1 : 0) +
    (filters.lang !== "all" ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // SEO metadata preserved
  const siteUrl = "https://salemylink.com";
  const singleCategory =
    filters.categories.length === 1
      ? categories.find((c) => c.slug === filters.categories[0])
      : undefined;

  const metaTitle = filters.q
    ? `${filters.q} - Tìm kiếm sản phẩm Digital | Salemylink.com`
    : singleCategory
      ? `${singleCategory.name} - Sản phẩm Digital | Salemylink.com`
      : "Tìm kiếm sản phẩm Digital chất lượng cao | Salemylink.com";

  const metaDescription = filters.q
    ? `Tìm thấy ${totalCount} sản phẩm digital cho "${filters.q}" tại Salemylink.com. Ebook, tài liệu, khóa học online giá tốt, thanh toán an toàn, tải về ngay.`
    : `Khám phá ${totalCount}+ sản phẩm digital chất lượng cao tại Salemylink.com. Ebook, tài liệu học tập, khóa học online với giá tốt nhất Việt Nam.`;

  const canonicalUrl = filters.q
    ? `${siteUrl}/search?q=${encodeURIComponent(filters.q)}`
    : `${siteUrl}/search`;

  const metaKeywords = [
    filters.q,
    singleCategory?.name,
    "sản phẩm digital",
    "ebook",
    "tài liệu online",
    "khóa học",
    "salemylink",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={metaTitle}
        description={metaDescription}
        keywords={metaKeywords}
        url={canonicalUrl}
        noindex={true}
      />

      <Header />

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Tìm kiếm & Lọc tài liệu" }]} />

        {/* Page Title + Search Input with Popular Keywords Autocomplete */}
        <section className="mb-6 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {filters.q ? (
                  <>
                    Kết quả cho{" "}
                    <span className="text-primary">“{filters.q}”</span>
                  </>
                ) : singleCategory ? (
                  <>
                    Tài liệu{" "}
                    <span className="text-primary">{singleCategory.name}</span>
                  </>
                ) : (
                  "Khám phá & tìm kiếm tài liệu số"
                )}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                {loading
                  ? "Đang tìm kiếm tài liệu..."
                  : `Hiển thị ${products.length} / ${totalCount} sản phẩm phù hợp`}
              </p>
            </div>

            {/* Search bar with Autocomplete */}
            <div ref={searchBoxRef} className="relative w-full lg:w-[400px] lg:shrink-0">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchInput}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setShowSuggestions(false);
                    }}
                    placeholder="Tìm tài liệu..."
                    className={`h-11 w-full rounded-lg border border-border-strong bg-surface pl-9 ${searchInput ? "pr-9" : "pr-3"} text-sm text-foreground placeholder:text-muted-foreground outline-hidden focus:border-primary focus:ring-2 focus:ring-ring/20`}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        updateFilters({ q: "", page: 1 });
                      }}
                      aria-label="Xoá từ khóa"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Button type="submit" className="h-11 px-4 shrink-0">
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Tìm</span>
                </Button>
              </form>

              {showSuggestions && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-popover)] animate-[popIn_140ms_ease-out]">
                  <div className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-accent" />
                    <span>Gợi ý tìm kiếm</span>
                  </div>
                  {filteredSuggestions.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        setSearchInput(kw);
                        setShowSuggestions(false);
                        updateFilters({ q: kw, page: 1 });
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{kw}</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filter chips + category shortcuts */}
          {(activeFilterCount > 0 || filters.q) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="text-xs font-medium text-muted-foreground">
                Đang lọc:
              </span>
              {filters.q && (
                <button
                  type="button"
                  onClick={() => updateFilters({ q: "", page: 1 })}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span>Từ khóa: “{filters.q}”</span>
                  <X className="h-3 w-3" />
                </button>
              )}
              {filters.categories.map((catSlug) => {
                const cat = categories.find((c) => c.slug === catSlug);
                return (
                  <button
                    key={catSlug}
                    type="button"
                    onClick={() =>
                      updateFilters({
                        categories: filters.categories.filter((c) => c !== catSlug),
                        page: 1,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <span>{cat?.name || catSlug}</span>
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
              {filters.freeOnly && (
                <button
                  type="button"
                  onClick={() => updateFilters({ freeOnly: false, page: 1 })}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span>Miễn phí</span>
                  <X className="h-3 w-3" />
                </button>
              )}
              {!filters.freeOnly &&
                (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE_SLIDER) && (
                  <button
                    type="button"
                    onClick={() =>
                      updateFilters({
                        minPrice: 0,
                        maxPrice: MAX_PRICE_SLIDER,
                        page: 1,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <span>
                      Giá: {formatMoneyVnd(filters.minPrice)} –{" "}
                      {formatMoneyVnd(filters.maxPrice)}
                    </span>
                    <X className="h-3 w-3" />
                  </button>
                )}
              {filters.hasRating && (
                <button
                  type="button"
                  onClick={() => updateFilters({ hasRating: false, page: 1 })}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span>Có đánh giá</span>
                  <X className="h-3 w-3" />
                </button>
              )}
              {filters.hasImage && (
                <button
                  type="button"
                  onClick={() => updateFilters({ hasImage: false, page: 1 })}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span>Có ảnh bìa</span>
                  <X className="h-3 w-3" />
                </button>
              )}
              {filters.lang !== "all" && (
                <button
                  type="button"
                  onClick={() => updateFilters({ lang: "all", page: 1 })}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span>{LANGUAGE_LABELS[filters.lang]}</span>
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-accent hover:underline ml-1"
              >
                Xoá tất cả
              </button>
            </div>
          )}
        </section>

        {/* Main 12-Col Layout: Sticky Filter Sidebar + Results Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Desktop Sticky Sidebar */}
          <aside
            className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20 rounded-2xl border border-border bg-surface p-5"
            aria-label="Bộ lọc sản phẩm"
          >
            <ProductFilterControls
              filters={filters}
              categories={categories}
              onChange={updateFilters}
              onReset={resetFilters}
            />
          </aside>

          {/* Main Column */}
          <div className="lg:col-span-9 min-w-0 space-y-5">
            {/* Toolbar: Mobile Filter Bottom Sheet + Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5">
              <div className="flex items-center gap-2">
                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden h-12 px-4 gap-2 scroll-mt-24"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Bộ lọc</span>
                      {activeFilterCount > 0 && (
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="max-h-[85vh] flex flex-col rounded-t-2xl p-0"
                  >
                    <SheetHeader className="border-b border-border px-5 py-4 text-left">
                      <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
                      <ProductFilterControls
                        filters={filters}
                        categories={categories}
                        onChange={updateFilters}
                        onReset={resetFilters}
                        onCloseMobile={() => setMobileFilterOpen(false)}
                        showResetTop={false}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <span className="hidden sm:inline text-sm font-medium text-muted-foreground tabular-nums">
                  {totalCount} kết quả
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
                  Sắp xếp:
                </span>
                <Select
                  value={filters.sort}
                  onValueChange={(value) =>
                    updateFilters({ sort: value as ProductSortOption, page: 1 })
                  }
                >
                  <SelectTrigger className="h-12 sm:h-10 w-[165px] min-[375px]:w-[180px] sm:w-[200px]">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="popular">Phổ biến nhất</SelectItem>
                    <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                    <SelectItem value="price_asc">Giá: Thấp đến cao</SelectItem>
                    <SelectItem value="price_desc">Giá: Cao đến thấp</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid / States */}
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : error ? (
              <ErrorState
                title="Không thể tải danh sách sản phẩm"
                description="Đã có sự cố khi kết nối dữ liệu. Vui lòng thử lại."
                onRetry={() => setReloadKey((k) => k + 1)}
              />
            ) : products.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sản phẩm"
                description="Không tìm thấy sản phẩm. Thử từ khóa khác hoặc điều chỉnh lại khoảng giá và danh mục."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="default" onClick={resetFilters}>
                      Xoá bộ lọc
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">Về trang chủ</Link>
                    </Button>
                  </div>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index < 2 ? "high" : "auto"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Phân trang"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <span className="text-xs sm:text-sm text-muted-foreground tabular-nums">
                      Trang <strong>{filters.page}</strong> / {totalPages}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page <= 1}
                        onClick={() =>
                          updateFilters({ page: Math.max(1, filters.page - 1) })
                        }
                        className="h-11 sm:h-10 px-3"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        <span>Trước</span>
                      </Button>

                      {Array.from({ length: totalPages })
                        .slice(
                          Math.max(0, filters.page - 3),
                          Math.min(totalPages, filters.page + 2)
                        )
                        .map((_, idx) => {
                          const start = Math.max(0, filters.page - 3);
                          const pageNum = start + idx + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pageNum === filters.page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => updateFilters({ page: pageNum })}
                              className={
                                pageNum === filters.page
                                  ? "h-11 sm:h-10 min-w-11 sm:min-w-10 px-2.5 tabular-nums"
                                  : "hidden sm:inline-flex sm:h-10 sm:min-w-10 px-2.5 tabular-nums"
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        })}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page >= totalPages}
                        onClick={() =>
                          updateFilters({
                            page: Math.min(totalPages, filters.page + 1),
                          })
                        }
                        className="h-11 sm:h-10 px-3"
                      >
                        <span>Sau</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>

        <RelatedCategories />
      </main>

      <Footer />
    </div>
  );
}
