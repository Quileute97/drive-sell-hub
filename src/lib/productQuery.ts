import { supabase } from "@/integrations/supabase/client";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

export type ProductLangFilter = "all" | "vi" | "en" | "zh" | "es";
export type ProductSortOption =
  | "newest"
  | "oldest"
  | "popular"
  | "price_asc"
  | "price_desc"
  | "rating";

export const MAX_PRICE_SLIDER = 500_000;
export const PRICE_STEP = 10_000;

export interface ProductFilterState {
  q: string;
  categories: string[]; // category slugs
  minPrice: number;
  maxPrice: number;
  hasRating: boolean;
  hasImage: boolean;
  freeOnly: boolean;
  lang: ProductLangFilter;
  sort: ProductSortOption;
  page: number;
}

export const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
  q: "",
  categories: [],
  minPrice: 0,
  maxPrice: MAX_PRICE_SLIDER,
  hasRating: false,
  hasImage: false,
  freeOnly: false,
  lang: "all",
  sort: "newest",
  page: 1,
};

export const LANGUAGE_LABELS: Record<ProductLangFilter, string> = {
  all: "Tất cả ngôn ngữ",
  vi: "Tiếng Việt (vi)",
  en: "English (en)",
  zh: "中文 (zh)",
  es: "Español (es)",
};

export const SHORT_LANG_LABELS: Record<string, string> = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "中文",
  es: "Español",
};

export const POPULAR_SEARCH_KEYWORDS = [
  "IELTS Writing",
  "Template Excel",
  "Y khoa",
  "Prompt AI",
  "Luận văn",
  "Source code React",
];

function parsePriceToken(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const trimmed = raw.trim().toLowerCase();
  if (/^\d+k$/.test(trimmed)) {
    const n = parseInt(trimmed.slice(0, -1), 10) * 1000;
    return Number.isFinite(n) ? Math.min(MAX_PRICE_SLIDER, Math.max(0, n)) : fallback;
  }
  const digits = parseInt(trimmed.replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(digits)) return fallback;
  return Math.min(MAX_PRICE_SLIDER, Math.max(0, digits));
}

export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams,
  allCategories?: { id: string; slug: string }[]
): ProductFilterState {
  const q = searchParams.get("q") || "";

  // Support both ?cat=slug1,slug2 and legacy ?category=<id-or-slug>
  const catParam = searchParams.get("cat");
  const legacyCat = searchParams.get("category");
  let categories: string[] = [];

  if (catParam && catParam !== "all" && catParam !== "tat-ca") {
    categories = catParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (legacyCat && legacyCat !== "all") {
    const foundById = allCategories?.find((c) => c.id === legacyCat || c.slug === legacyCat);
    categories = [foundById ? foundById.slug : legacyCat];
  }

  const freeOnly =
    searchParams.get("free") === "on" || searchParams.get("free") === "true";

  const minPrice = freeOnly
    ? 0
    : parsePriceToken(searchParams.get("minPrice") || searchParams.get("min"), 0);

  const rawMax =
    searchParams.get("maxPrice") || searchParams.get("max") || searchParams.get("price");
  const maxPrice = freeOnly ? 0 : Math.max(minPrice, parsePriceToken(rawMax, MAX_PRICE_SLIDER));

  const hasRating =
    searchParams.get("rating") === "on" || searchParams.get("rating") === "true";
  const hasImage =
    searchParams.get("hasImage") === "on" || searchParams.get("hasImage") === "true";

  const rawLang = searchParams.get("docLang") || searchParams.get("lang");
  const lang: ProductLangFilter =
    rawLang === "vi" || rawLang === "en" || rawLang === "zh" || rawLang === "es"
      ? rawLang
      : "all";

  const rawSort = searchParams.get("sort");
  const sort: ProductSortOption =
    rawSort === "newest" ||
    rawSort === "oldest" ||
    rawSort === "popular" ||
    rawSort === "price_asc" ||
    rawSort === "price_desc" ||
    rawSort === "rating"
      ? rawSort
      : "newest";

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  return {
    q,
    categories,
    minPrice,
    maxPrice,
    hasRating,
    hasImage,
    freeOnly,
    lang,
    sort,
    page,
  };
}

export function serializeFiltersToSearchParams(
  state: ProductFilterState,
  options?: { omitCategories?: boolean }
): URLSearchParams {
  const params = new URLSearchParams();

  if (state.q.trim()) params.set("q", state.q.trim());
  if (!options?.omitCategories && state.categories.length > 0) {
    params.set("cat", state.categories.join(","));
  }
  if (state.freeOnly) {
    params.set("free", "on");
  } else {
    if (state.minPrice > 0) params.set("minPrice", String(state.minPrice));
    if (state.maxPrice < MAX_PRICE_SLIDER) params.set("maxPrice", String(state.maxPrice));
  }
  if (state.hasRating) params.set("rating", "on");
  if (state.hasImage) params.set("hasImage", "on");
  if (state.lang !== "all") params.set("docLang", state.lang);
  if (state.sort !== "newest") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));

  return params;
}

export function formatMoneyVnd(price: number | null | undefined): string {
  const n = Number(price || 0);
  if (n <= 0) return "Miễn phí";
  return `${new Intl.NumberFormat("vi-VN").format(n)} đ`;
}

export function stripHtmlTags(raw?: string | null): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[\r\n\t\s]+/g, " ")
    .trim();
}

/**
 * Truncate summary <= 150 chars at word boundary.
 * Returns "" when description/short_description are empty (requirement 3.2: hidden if empty).
 */
export function getShortSummary(
  shortDesc?: string | null,
  description?: string | null,
  maxLength = 150
): string {
  const source = stripHtmlTags(shortDesc) || stripHtmlTags(description);
  if (!source) return "";
  const fixed = fixVietnameseEncoding(source).trim();
  if (!fixed) return "";
  if (fixed.length <= maxLength) return fixed;
  const slice = fixed.slice(0, maxLength - 1);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > Math.floor(maxLength * 0.6)) {
    return `${slice.slice(0, lastSpace)}…`;
  }
  return `${slice}…`;
}

export function inferProductLanguage(product: {
  language?: string | null;
  title?: string | null;
  short_description?: string | null;
  tags?: string[] | null;
}): "vi" | "en" | "zh" | "es" {
  const explicit = (product.language || "").toLowerCase().trim();
  if (explicit === "vi" || explicit === "en" || explicit === "zh" || explicit === "es") {
    return explicit;
  }

  const hay = `${product.title || ""} ${product.short_description || ""} ${(product.tags || []).join(" ")}`;
  if (/[\u4e00-\u9fff]/.test(hay)) return "zh";
  if (/\b(español|spanish|cursillo|guía)\b/i.test(hay)) return "es";

  const hasViDiacritics =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(hay);
  if (!hasViDiacritics && /[a-z]{3,}/i.test(hay)) {
    return "en";
  }
  return "vi";
}

export interface ProductQueryParams {
  filters: ProductFilterState;
  categoryIdsMap?: Map<string, string>; // slug -> id
  fixedCategoryId?: string;
  pageSize?: number;
}

export async function queryFilteredProducts<T = any>({
  filters,
  categoryIdsMap,
  fixedCategoryId,
  pageSize = 12,
}: ProductQueryParams): Promise<{
  items: T[];
  totalCount: number;
  usedClientLangFallback: boolean;
}> {
  const runSupabaseQuery = async (withLanguageCol: boolean) => {
    const from = (filters.page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("products")
      .select(
        `
        id, slug, title, short_description, description, price, original_price,
        thumbnail_url, images, google_drive_link, download_only_link, read_only,
        download_count, view_count, rating_average, rating_count,
        file_format, file_size, tags, seller_id, category_id, created_at, updated_at,
        profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
        categories(id, name, slug)
      `,
        withLanguageCol && filters.lang !== "all" ? { count: "exact" } : { count: "exact" }
      )
      .eq("status", "active");

    if (filters.q.trim()) {
      const term = filters.q.trim().replace(/[%_]/g, "");
      if (term) {
        query = query.or(
          `title.ilike.%${term}%,short_description.ilike.%${term}%,description.ilike.%${term}%`
        );
      }
    }

    if (fixedCategoryId) {
      query = query.eq("category_id", fixedCategoryId);
    } else if (filters.categories.length > 0 && categoryIdsMap) {
      const resolvedIds = filters.categories
        .map((slugOrId) => categoryIdsMap.get(slugOrId) || slugOrId)
        .filter(Boolean);
      if (resolvedIds.length === 1) {
        query = query.eq("category_id", resolvedIds[0]!);
      } else if (resolvedIds.length > 1) {
        query = query.in("category_id", resolvedIds);
      }
    }

    if (filters.freeOnly) {
      query = query.eq("price", 0);
    } else {
      if (filters.minPrice > 0) {
        query = query.gte("price", filters.minPrice);
      }
      if (filters.maxPrice < MAX_PRICE_SLIDER) {
        query = query.lte("price", filters.maxPrice);
      }
    }

    if (filters.hasRating) {
      query = query.gt("rating_count", 0);
    }

    if (filters.hasImage) {
      query = query.not("thumbnail_url", "is", null).neq("thumbnail_url", "");
    }

    if (withLanguageCol && filters.lang !== "all") {
      query = (query as any).eq("language", filters.lang);
    }

    switch (filters.sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "popular":
        query = query.order("download_count", { ascending: false });
        break;
      case "rating":
        query = query.order("rating_average", { ascending: false }).order("rating_count", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // If filtering by language in fallback mode, fetch broader window before paginating
    if (!withLanguageCol && filters.lang !== "all") {
      return query.limit(200);
    }

    return query.range(from, to);
  };

  const res = await runSupabaseQuery(filters.lang !== "all");
  if (!res.error) {
    return {
      items: (res.data || []) as T[],
      totalCount: res.count ?? (res.data?.length || 0),
      usedClientLangFallback: false,
    };
  }

  // Fallback if remote Supabase DB has not applied the `language` column migration yet
  const errMsg = `${res.error.message || ""} ${res.error.code || ""}`;
  if (filters.lang !== "all" && /language|42703|PGRST204/i.test(errMsg)) {
    const fallback = await runSupabaseQuery(false);
    if (fallback.error) throw fallback.error;
    const matched = ((fallback.data || []) as any[]).filter(
      (item) => inferProductLanguage(item) === filters.lang
    );
    const from = (filters.page - 1) * pageSize;
    return {
      items: matched.slice(from, from + pageSize) as T[],
      totalCount: matched.length,
      usedClientLangFallback: true,
    };
  }

  throw res.error;
}
