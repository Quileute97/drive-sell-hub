import { GUIDES } from "../data/guides";
import { getPopularTagSlugs } from "../data/seoOverrides";
import { getSellerSlug } from "../lib/sellerUtils";
import { SITE_URL } from "../lib/seoHead";

interface EnvLike {
  SUPABASE_URL?: string | undefined;
  VITE_SUPABASE_URL?: string | undefined;
  SUPABASE_PUBLISHABLE_KEY?: string | undefined;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string | undefined;
  SUPABASE_ANON_KEY?: string | undefined;
  VITE_SUPABASE_ANON_KEY?: string | undefined;
}

const DEFAULT_SUPABASE_URL = "https://dfalphamyvdfewixrnju.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzUwODksImV4cCI6MjA3MTYxMTA4OX0.1Jq2r7Y57ZgeeHcbEwpRQI_5pwAkBl3CPpinHgL__e0";

const STATIC_PUBLIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/nguoi-ban", priority: "0.85", changefreq: "weekly" },
  { path: "/huong-dan", priority: "0.85", changefreq: "weekly" },
  { path: "/about", priority: "0.75", changefreq: "monthly" },
  { path: "/how-it-works", priority: "0.75", changefreq: "monthly" },
  { path: "/seller-guide", priority: "0.75", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.40", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.40", changefreq: "yearly" },
] as const;

function escapeXml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIsoDate(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString().slice(0, 10);
}

function extractDriveFileId(driveUrl: string | null | undefined): string | null {
  if (!driveUrl) return null;
  const fileMatch = driveUrl.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch?.[1]) return fileMatch[1];
  const workspaceMatch = driveUrl.match(/\/(?:document|presentation|spreadsheets|forms)\/d\/([^/?#]+)/);
  if (workspaceMatch?.[1]) return workspaceMatch[1];
  const openMatch = driveUrl.match(/[?&]id=([^&#]+)/);
  if (openMatch?.[1]) return openMatch[1];
  return null;
}

function resolveSitemapProductImage(prod: {
  thumbnail_url?: string | null;
  images?: unknown;
  google_drive_link?: string | null;
}): string | null {
  const candidates: string[] = [];
  if (typeof prod.thumbnail_url === "string" && prod.thumbnail_url.trim()) {
    candidates.push(prod.thumbnail_url.trim());
  }
  if (Array.isArray(prod.images)) {
    for (const img of prod.images) {
      if (typeof img === "string" && img.trim()) {
        candidates.push(img.trim());
      }
    }
  }

  for (const raw of candidates) {
    if (/placeholder/i.test(raw) || raw.startsWith("data:")) continue;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return `${SITE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
  }

  const fileId = extractDriveFileId(prod.google_drive_link);
  if (fileId && !fileId.startsWith("sample")) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
  }
  return null;
}

interface SitemapImage {
  loc: string;
  title?: string | undefined;
  caption?: string | undefined;
}

function buildUrlEntry(
  routePath: string,
  priority: string,
  changefreq: string,
  lastmod: string,
  image?: SitemapImage | null | undefined
): string {
  const cleanPath = routePath === "/" ? "/" : `/${routePath.replace(/^\/+|\/+$/g, "")}`;
  const canonicalUrl = `${SITE_URL}${cleanPath}`;
  const escapedUrl = escapeXml(canonicalUrl);

  let xml = `  <url>
    <loc>${escapedUrl}</loc>
    <xhtml:link rel="alternate" hreflang="vi" href="${escapedUrl}"/>
    <xhtml:link rel="alternate" hreflang="vi-VN" href="${escapedUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapedUrl}"/>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

  if (image?.loc) {
    xml += `
    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>${
        image.title ? `\n      <image:title>${escapeXml(image.title)}</image:title>` : ""
      }${
        image.caption
          ? `\n      <image:caption>${escapeXml(image.caption)}</image:caption>`
          : image.title
            ? `\n      <image:caption>${escapeXml(image.title)}</image:caption>`
            : ""
      }
    </image:image>`;
  }

  xml += `\n  </url>`;
  return xml;
}

async function fetchSupabaseRest<T>(
  supabaseUrl: string,
  supabaseKey: string,
  table: string,
  select: string,
  filter = "",
  maxRows = 5000
): Promise<T[]> {
  const results: T[] = [];
  const pageSize = 1000;
  let offset = 0;

  while (offset < maxRows) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const url = `${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}&offset=${offset}&limit=${pageSize}${
        filter ? `&${filter}` : ""
      }`;
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (!resp.ok) break;
      const page = (await resp.json()) as T[];
      if (!Array.isArray(page) || page.length === 0) break;
      results.push(...page);
      if (page.length < pageSize) break;
      offset += pageSize;
    } catch {
      break;
    } finally {
      clearTimeout(timer);
    }
  }

  return results;
}

export function buildSitemapIndexXml(today = todayIsoDate()): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${escapeXml(today)}</lastmod>
  </sitemap>
</sitemapindex>`;
}

export async function buildDynamicSitemapXml(env?: EnvLike): Promise<string | null> {
  const supabaseUrl = (env?.SUPABASE_URL || env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, "");
  const supabaseKey =
    env?.SUPABASE_PUBLISHABLE_KEY ||
    env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env?.SUPABASE_ANON_KEY ||
    env?.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  const today = todayIsoDate();

  const [products, categories, sellers] = await Promise.all([
    fetchSupabaseRest<{
      slug: string | null;
      title: string | null;
      thumbnail_url: string | null;
      images: unknown;
      google_drive_link: string | null;
      short_description: string | null;
      download_count: number | null;
      view_count: number | null;
      is_featured: boolean | null;
      tags: string[] | null;
      updated_at: string | null;
      created_at: string | null;
      seller_id: string | null;
    }>(
      supabaseUrl,
      supabaseKey,
      "products",
      "slug,title,thumbnail_url,images,google_drive_link,short_description,download_count,view_count,is_featured,tags,updated_at,created_at,seller_id",
      "status=eq.active&order=updated_at.desc.nullslast,created_at.desc"
    ),
    fetchSupabaseRest<{ slug: string | null; updated_at: string | null }>(
      supabaseUrl,
      supabaseKey,
      "categories",
      "slug,updated_at",
      "is_active=eq.true"
    ),
    fetchSupabaseRest<{ user_id: string | null; id: string | null; full_name: string | null; updated_at: string | null }>(
      supabaseUrl,
      supabaseKey,
      "profiles",
      "id,user_id,full_name,updated_at",
      "role=eq.seller"
    ),
  ]);

  if (products.length === 0 && categories.length === 0) {
    return null;
  }

  const seenPaths = new Set<string>();
  const urlEntries: string[] = [];

  const pushUnique = (
    routePath: string,
    priority: string,
    changefreq: string,
    lastmod: string,
    image?: SitemapImage | null | undefined
  ) => {
    const clean = routePath === "/" ? "/" : `/${routePath.replace(/^\/+|\/+$/g, "")}`;
    if (seenPaths.has(clean)) return;
    seenPaths.add(clean);
    urlEntries.push(buildUrlEntry(clean, priority, changefreq, lastmod, image));
  };

  // 1. Public indexable static routes
  for (const r of STATIC_PUBLIC_ROUTES) {
    pushUnique(r.path, r.priority, r.changefreq, today);
  }

  // 2. Active categories
  for (const cat of categories) {
    if (!cat.slug) continue;
    pushUnique(`/danh-muc/${encodeURIComponent(cat.slug)}`, "0.85", "weekly", toIsoDate(cat.updated_at, today));
  }

  // 3. Canonical Learning Guides (no duplicate alias slugs)
  for (const guide of GUIDES) {
    pushUnique(`/huong-dan/${guide.slug}`, "0.85", "weekly", toIsoDate(guide.updatedAt, today));
  }

  // 4. Active tags (merge curated SEO tags + live tags used in active products)
  const tagCounts = new Map<string, number>();
  for (const t of getPopularTagSlugs()) {
    tagCounts.set(t, 100);
  }
  for (const prod of products) {
    if (!Array.isArray(prod.tags)) continue;
    for (const rawTag of prod.tags) {
      const normalized = typeof rawTag === "string" ? rawTag.trim().toLowerCase() : "";
      if (!normalized || normalized.length < 2) continue;
      tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
    }
  }
  const activeTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([tag]) => tag);

  for (const tag of activeTags) {
    pushUnique(`/tag/${encodeURIComponent(tag)}`, "0.70", "weekly", today);
  }

  // 5. Canonical Seller profiles (prefer sellers with active products; use canonical slug matching ProductCard & /nguoi-ban)
  const activeSellerIds = new Set(products.map((p) => p.seller_id).filter(Boolean));
  for (const seller of sellers) {
    const uid = seller.user_id || seller.id;
    if (!uid) continue;
    if (activeSellerIds.size > 0 && !activeSellerIds.has(uid)) continue;
    const sellerSlug = getSellerSlug({ full_name: seller.full_name, user_id: uid });
    if (!sellerSlug) continue;
    pushUnique(`/nguoi-ban/${encodeURIComponent(sellerSlug)}`, "0.70", "weekly", toIsoDate(seller.updated_at, today));
  }

  // 6. Active Products
  for (const prod of products) {
    if (!prod.slug) continue;
    const lastmod = toIsoDate(prod.updated_at || prod.created_at, today);
    let priority = "0.70";
    if (prod.is_featured) {
      priority = "0.95";
    } else if ((prod.download_count || 0) > 30 || (prod.view_count || 0) > 100) {
      priority = "0.90";
    } else if ((prod.download_count || 0) > 10 || (prod.view_count || 0) > 30) {
      priority = "0.80";
    }

    const imgLoc = resolveSitemapProductImage(prod);
    const img = imgLoc
      ? {
          loc: imgLoc,
          title: prod.title || undefined,
          caption: prod.short_description
            ? prod.short_description.slice(0, 160)
            : prod.title
              ? `Mua ${prod.title} trên Salemylink`
              : undefined,
        }
      : null;

    pushUnique(`/san-pham/${prod.slug}`, priority, "weekly", lastmod, img);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>`;
}
