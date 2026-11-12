// Shared helper to build TanStack Start route head() metadata (SSR-rendered) with SEO & OpenGraph support.
import { SupportedLanguage, DEFAULT_LANGUAGE } from "./i18n/languages";

export const SITE_URL = "https://salemylink.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export interface HeadInput {
  title: string;
  description: string;
  path: string; // e.g. "/tag/ielts" or "/"
  keywords?: string | string[] | undefined;
  image?: string | undefined;
  type?: "website" | "article" | "product" | undefined;
  noindex?: boolean | undefined;
  ogTitle?: string | undefined;
  ogDescription?: string | undefined;
  twTitle?: string | undefined;
  twDescription?: string | undefined;
  structuredData?: object | object[] | undefined;
  lang?: SupportedLanguage | undefined;
  publishedTime?: string | undefined;
  modifiedTime?: string | undefined;
  author?: string | undefined;
  price?: number | undefined;
  currency?: string | undefined;
}

const clamp = (raw: string, maxLen = 160): string => {
  const normalized = (raw || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLen) return normalized;
  const sliced = normalized.slice(0, maxLen - 3);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > Math.floor(maxLen * 0.6)) {
    return `${sliced.slice(0, lastSpace)}...`;
  }
  return `${sliced}...`;
};

export function buildHead(input: HeadInput) {
  const {
    title,
    description,
    path,
    keywords,
    image = DEFAULT_IMAGE,
    type = "website",
    noindex = false,
    ogTitle,
    ogDescription,
    twTitle,
    twDescription,
    structuredData,
    lang = DEFAULT_LANGUAGE,
    publishedTime,
    modifiedTime,
    author,
    price,
    currency = "VND",
  } = input;

  const fullTitle = title.includes("Salemylink") ? title : `${title} | Salemylink`;
  const cleanPath = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  const canonical = `${SITE_URL}${cleanPath || "/"}`;
  const desc = clamp(description);
  const socialTitle = ogTitle || fullTitle;
  const socialDesc = clamp(ogDescription || description);
  const twitterDesc = clamp(twDescription || ogDescription || description);
  const robots = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  // Base Meta Tags
  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: desc },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
    { name: "bingbot", content: robots },
    { name: "baiduspider", content: robots },
    { name: "yandexbot", content: robots },
    { property: "og:type", content: type },
    { property: "og:url", content: canonical },
    { property: "og:title", content: socialTitle },
    { property: "og:description", content: socialDesc },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: socialTitle },
    // OpenGraph Locale (Vietnamese)
    { property: "og:locale", content: lang === "en" ? "en_US" : lang === "zh" ? "zh_CN" : lang === "es" ? "es_ES" : "vi_VN" },
    { property: "og:site_name", content: "Salemylink.com" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@salemylink" },
    { name: "twitter:creator", content: "@salemylink" },
    { name: "twitter:url", content: canonical },
    { name: "twitter:title", content: twTitle || socialTitle },
    { name: "twitter:description", content: twitterDesc },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: twTitle || socialTitle },
    { name: "language", content: "Vietnamese" },
    { httpEquiv: "content-language", content: "vi" },
    { name: "geo.region", content: "VN" },
    { name: "geo.placename", content: "Vietnam" },
  ];

  if (type === "product" && typeof price === "number" && Number.isFinite(price)) {
    meta.push(
      { property: "product:price:amount", content: String(price) },
      { property: "product:price:currency", content: currency }
    );
  }
  if (publishedTime) {
    meta.push({ property: "article:published_time", content: publishedTime });
  }
  if (modifiedTime) {
    meta.push({ property: "article:modified_time", content: modifiedTime });
  }
  if (author) {
    meta.push({ property: "article:author", content: author });
  }

  if (keywords) {
    meta.push({
      name: "keywords",
      content: Array.isArray(keywords) ? keywords.join(", ") : keywords,
    });
  }

  // Canonical and Hreflang Alternate Links (only for indexable pages)
  const links: Array<Record<string, string>> = [];

  if (!noindex) {
    links.push({ rel: "canonical", href: canonical });
    links.push({ rel: "alternate", hrefLang: "vi", href: canonical });
    links.push({ rel: "alternate", hrefLang: "vi-VN", href: canonical });
    links.push({ rel: "alternate", hrefLang: "x-default", href: canonical });
  }

  const head: {
    meta: Array<Record<string, string>>;
    links: Array<Record<string, string>>;
    scripts?: Array<Record<string, string>>;
  } = {
    meta,
    links,
  };

  if (structuredData) {
    const formattedData = Array.isArray(structuredData)
      ? { "@context": "https://schema.org", "@graph": structuredData }
      : "@context" in structuredData
        ? structuredData
        : { "@context": "https://schema.org", ...structuredData };

    head.scripts = [
      {
        type: "application/ld+json",
        id: "page-structured-data",
        "data-seo-managed": "true",
        children: JSON.stringify(formattedData),
      },
    ];
  }

  return head;
}
