import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedCategories } from "@/components/RelatedCategories";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { ProductFilterControls } from "@/components/ProductFilterControls";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/States";
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
import { useNavigate, useParams, useSearchParams } from "@/lib/router-compat";
import { getCategorySeo } from "@/data/seoOverrides";
import {
  LANGUAGE_LABELS,
  MAX_PRICE_SLIDER,
  formatMoneyVnd,
  parseFiltersFromSearchParams,
  queryFilteredProducts,
  serializeFiltersToSearchParams,
  type ProductFilterState,
  type ProductSortOption,
} from "@/lib/productQuery";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";

interface CategoryInfo {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  updated_at: string;
}

const PAGE_SIZE = 12;

export default function Category({
  initialCategory,
  initialProducts,
}: {
  initialCategory?: CategoryInfo | null;
  initialProducts?: any[];
}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState<CategoryInfo | null>(
    initialCategory || null
  );
  const [products, setProducts] = useState<ProductCardData[]>(() =>
    (initialProducts || []).slice(0, PAGE_SIZE)
  );
  const [totalCount, setTotalCount] = useState<number>(
    initialProducts?.length || 0
  );
  const [loading, setLoading] = useState(!initialCategory);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  // Sync category metadata when route slug changes
  useEffect(() => {
    if (initialCategory && initialCategory.slug === slug) {
      setCategory(initialCategory);
      setLoading(false);
      return;
    }

    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const loadCategory = async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (cancelled) return;
        if (err || !data) {
          setCategory(null);
        } else {
          setCategory(data as CategoryInfo);
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        if (!cancelled) setCategory(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCategory();
    return () => {
      cancelled = true;
    };
  }, [slug, initialCategory]);

  // Query server-filtered products for this category whenever URL filters change
  useEffect(() => {
    if (!category?.id) return;

    const isDefaultState =
      !filters.q &&
      filters.minPrice === 0 &&
      filters.maxPrice === MAX_PRICE_SLIDER &&
      !filters.hasRating &&
      !filters.hasImage &&
      !filters.freeOnly &&
      filters.lang === "all" &&
      filters.sort === "newest" &&
      filters.page === 1;

    // Preserve SSR-hydrated first page immediately while still fetching accurate total count if needed
    if (isDefaultState && initialCategory?.id === category.id && initialProducts && initialProducts.length > 0 && initialProducts.length < 24) {
      setProducts(
        initialProducts.slice(0, PAGE_SIZE).map((p: any) => ({
          ...p,
          thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
          images: sanitizeImageArray(p.images),
        }))
      );
      setTotalCount(initialProducts.length);
      setFiltering(false);
      setError(false);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setFiltering(true);
      setError(false);
      try {
        const res = await queryFilteredProducts<ProductCardData>({
          filters,
          fixedCategoryId: category.id,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        setProducts(
          (res.items || []).map((p: any) => ({
            ...p,
            thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
            images: sanitizeImageArray(p.images),
          }))
        );
        setTotalCount(res.totalCount);
      } catch (err) {
        console.error("Error filtering category products:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setFiltering(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [category?.id, filters, reloadKey, initialCategory?.id, initialProducts]);

  const updateFilters = (patch: Partial<ProductFilterState>) => {
    const next: ProductFilterState = { ...filters, ...patch };
    setSearchParams(
      serializeFiltersToSearchParams(next, { omitCategories: true })
    );
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount =
    (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE_SLIDER ? 1 : 0) +
    (filters.hasRating ? 1 : 0) +
    (filters.hasImage ? 1 : 0) +
    (filters.freeOnly ? 1 : 0) +
    (filters.lang !== "all" ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          <div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />
          <ProductGridSkeleton count={6} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
          <ErrorState
            title="Không tìm thấy danh mục"
            description="Danh mục này hiện không tồn tại hoặc đã bị ẩn khỏi hệ thống."
            action={
              <Button onClick={() => navigate("/")}>Về trang chủ</Button>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const siteUrl = "https://salemylink.com";
  const categoryUrl = `${siteUrl}/danh-muc/${category.slug}`;
  const categoryImage = category.image_url || `${siteUrl}/og-image.png`;
  const seoOverride = getCategorySeo(category.slug, category.name);
  const countSuffix = totalCount > 0 ? ` Hiện có ${totalCount} sản phẩm.` : "";
  const metaDescription = `${seoOverride.description}${countSuffix}`.substring(
    0,
    160
  );
  const metaKeywords = [
    ...(seoOverride.keywords || []),
    category.name,
    `${category.name} giá rẻ`,
    `mua ${category.name}`,
    `tải ${category.name}`,
    "sản phẩm digital",
    "salemylink",
  ].join(", ");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoOverride.title}
        description={metaDescription}
        keywords={metaKeywords}
        url={categoryUrl}
        image={categoryImage}
        ogTitle={seoOverride.ogTitle}
        ogDescription={`${seoOverride.ogDescription}${countSuffix}`}
        twTitle={seoOverride.twTitle}
        twDescription={seoOverride.twDescription}
        modifiedTime={new Date(category.updated_at).toISOString()}
      />

      <Header />

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: category.name }]} />

        {/* Category Header Card */}
        <header className="mb-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {category.description}
                </p>
              )}
            </div>
            <div className="shrink-0 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-primary tabular-nums">
              {totalCount} sản phẩm
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="text-xs font-medium text-muted-foreground">
                Đang lọc:
              </span>
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
                      {formatMoneyVnd(filters.minPrice)} –{" "}
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
        </header>

        {/* 12-Col Layout: Sticky Filter Sidebar + Category Products */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <aside
            className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20 rounded-2xl border border-border bg-surface p-5"
            aria-label="Bộ lọc trong danh mục"
          >
            <ProductFilterControls
              filters={filters}
              categories={[]}
              hideCategories
              onChange={updateFilters}
              onReset={resetFilters}
            />
          </aside>

          <div className="lg:col-span-9 min-w-0 space-y-5">
            {/* Toolbar */}
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
                      <SheetTitle>Bộ lọc — {category.name}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
                      <ProductFilterControls
                        filters={filters}
                        categories={[]}
                        hideCategories
                        onChange={updateFilters}
                        onReset={resetFilters}
                        onCloseMobile={() => setMobileFilterOpen(false)}
                        showResetTop={false}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <span className="hidden sm:inline text-sm text-muted-foreground tabular-nums">
                  {totalCount} tài liệu
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

            {filtering ? (
              <ProductGridSkeleton count={6} />
            ) : error ? (
              <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
            ) : products.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sản phẩm phù hợp"
                description={
                  activeFilterCount > 0
                    ? "Không tìm thấy sản phẩm. Thử bỏ bớt điều kiện lọc giá hoặc ngôn ngữ."
                    : `Danh mục ${category.name} hiện đang được cập nhật thêm tài liệu mới.`
                }
                action={
                  activeFilterCount > 0 ? (
                    <Button variant="outline" onClick={resetFilters}>
                      Xoá bộ lọc
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <section aria-label={`Danh sách sản phẩm ${category.name}`} className="space-y-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      hideCategory
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index < 2 ? "high" : "auto"}
                    />
                  ))}
                </div>

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

                {/* SEO text block for crawlers */}
                <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground leading-relaxed">
                  <h2 className="mb-2 text-base font-semibold text-foreground">
                    Mua {category.name} chất lượng cao tại Salemylink.com
                  </h2>
                  <p className="text-pretty">
                    Salemylink.com cung cấp {totalCount} sản phẩm {category.name}{" "}
                    được tuyển chọn kỹ lưỡng. Thanh toán nhanh chóng qua nhiều
                    phương thức, nhận link Google Drive ngay sau khi thanh toán
                    thành công.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>

        <RelatedCategories
          currentCategoryId={category.id}
          title={`Danh mục liên quan đến ${category.name}`}
        />
      </main>

      <Footer />
    </div>
  );
}
