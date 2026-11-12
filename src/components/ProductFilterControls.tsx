import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import {
  LANGUAGE_LABELS,
  MAX_PRICE_SLIDER,
  type ProductFilterState,
  type ProductLangFilter,
} from "@/lib/productQuery";

export interface FilterCategoryOption {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

interface ProductFilterControlsProps {
  filters: ProductFilterState;
  categories: FilterCategoryOption[];
  onChange: (patch: Partial<ProductFilterState>) => void;
  onReset: () => void;
  hideCategories?: boolean;
  onCloseMobile?: () => void;
  showResetTop?: boolean;
}

export function ProductFilterControls({
  filters,
  categories,
  onChange,
  onReset,
  hideCategories = false,
  onCloseMobile,
  showResetTop = true,
}: ProductFilterControlsProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const toggleCategorySlug = (slug: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...filters.categories, slug]))
      : filters.categories.filter((c) => c !== slug);
    onChange({ categories: next, page: 1 });
  };

  const hasCheckedHiddenCategory = categories
    .slice(5)
    .some((cat) => filters.categories.includes(cat.slug));
  const visibleCategories =
    showAllCategories || hasCheckedHiddenCategory ? categories : categories.slice(0, 5);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < MAX_PRICE_SLIDER ||
    filters.hasRating ||
    filters.hasImage ||
    filters.freeOnly ||
    filters.lang !== "all";

  return (
    <div className="space-y-4">
      {showResetTop && (
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-semibold text-foreground">Bộ lọc</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-primary hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xoá lọc</span>
            </button>
          )}
        </div>
      )}

      {!hideCategories && categories.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Danh mục & Chủ đề
          </legend>
          <div className="space-y-1 pt-1">
            {visibleCategories.map((cat) => {
              const checked = filters.categories.includes(cat.slug);
              return (
                <label
                  key={cat.id}
                  className="flex min-h-12 md:min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(val) => toggleCategorySlug(cat.slug, val === true)}
                  />
                  <span className={`min-w-0 flex-1 truncate ${checked ? "font-medium" : ""}`}>
                    {cat.name}
                  </span>
                  {typeof cat.product_count === "number" && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {cat.product_count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          {categories.length > 5 && !hasCheckedHiddenCategory && (
            <button
              type="button"
              onClick={() => setShowAllCategories((prev) => !prev)}
              className="inline-flex min-h-11 md:min-h-9 w-full items-center justify-center gap-1 rounded-xl border border-border-strong bg-surface px-3 text-xs font-medium text-foreground transition-colors hover:bg-button-hover"
            >
              {showAllCategories ? (
                <>
                  <span>Thu gọn danh mục</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>Xem thêm {categories.length - 5} danh mục</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </fieldset>
      )}

      <div className={!hideCategories && categories.length > 0 ? "border-t border-border pt-3" : ""}>
        <PriceRangeSlider
          min={filters.minPrice}
          max={filters.maxPrice}
          disabled={filters.freeOnly}
          onChange={(minPrice, maxPrice) => onChange({ minPrice, maxPrice, page: 1 })}
        />
      </div>

      <fieldset className="space-y-1 border-t border-border pt-3">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Chất lượng & Định dạng
        </legend>

        <label className="flex min-h-12 md:min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2 text-sm text-foreground transition-colors hover:bg-muted">
          <Checkbox
            checked={filters.hasRating}
            onCheckedChange={(val) => onChange({ hasRating: val === true, page: 1 })}
          />
          <span>Có đánh giá</span>
        </label>

        <label className="flex min-h-12 md:min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2 text-sm text-foreground transition-colors hover:bg-muted">
          <Checkbox
            checked={filters.hasImage}
            onCheckedChange={(val) => onChange({ hasImage: val === true, page: 1 })}
          />
          <span>Có ảnh bìa</span>
        </label>

        <label className="flex min-h-12 md:min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2 text-sm text-foreground transition-colors hover:bg-muted">
          <Checkbox
            checked={filters.freeOnly}
            onCheckedChange={(val) =>
              onChange({
                freeOnly: val === true,
                minPrice: 0,
                maxPrice: val === true ? 0 : MAX_PRICE_SLIDER,
                page: 1,
              })
            }
          />
          <span>Chỉ tài liệu miễn phí</span>
        </label>
      </fieldset>

      <div className="space-y-1.5 border-t border-border pt-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ngôn ngữ tài liệu
        </span>
        <Select
          value={filters.lang}
          onValueChange={(val) => onChange({ lang: val as ProductLangFilter, page: 1 })}
        >
          <SelectTrigger aria-label="Chọn ngôn ngữ tài liệu">
            <SelectValue placeholder="Tất cả ngôn ngữ" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {onCloseMobile ? (
        <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-4">
          <Button type="button" variant="outline" className="min-h-12" onClick={onReset}>
            Đặt lại
          </Button>
          <Button type="button" className="min-h-12" onClick={onCloseMobile}>
            Áp dụng
          </Button>
        </div>
      ) : (
        hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-12 md:min-h-10"
            onClick={onReset}
          >
            Xoá mọi bộ lọc
          </Button>
        )
      )}
    </div>
  );
}

