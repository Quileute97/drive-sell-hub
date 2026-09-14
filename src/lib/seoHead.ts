// Shared helper to build TanStack Start route head() metadata (SSR-rendered) with full Multilingual SEO.
import { SupportedLanguage, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "./i18n/languages";

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
}

const clamp = (s: string, n = 160) => (s.length > n ? `${s.slice(0, n - 3)}...` : s);

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
  } = input;

  const fullTitle = title.includes("Salemylink") ? title : `${title} | Salemylink`;
  const cleanPath = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  const canonical = `${SITE_URL}${cleanPath || "/"}`;
  const desc = clamp(description);
  const socialTitle = ogTitle || fullTitle;
  const socialDesc = clamp(ogDescription || description);
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
    { property: "og:image:alt", content: fullTitle },
    // OpenGraph Locale (Vietnamese)
    { property: "og:locale", content: "vi_VN" },
    { property: "og:site_name", content: "Salemylink.com" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: canonical },
    { name: "twitter:title", content: twTitle || socialTitle },
    { name: "twitter:description", content: clamp(twDescription || ogDescription || description) },
    { name: "twitter:image", content: image },
    { name: "language", content: "Vietnamese" },
    { httpEquiv: "content-language", content: "vi" },
    { name: "geo.region", content: "VN" },
    { name: "geo.placename", content: "Vietnam" },
  ];

  if (keywords) {
    meta.push({
      name: "keywords",
      content: Array.isArray(keywords) ? keywords.join(", ") : keywords,
    });
  }

  // Canonical and Hreflang Alternate Links
  const links: Array<Record<string, string>> = [];

  if (!noindex) {
    // Canonical points to default primary Vietnamese URL
    links.push({ rel: "canonical", href: canonical });

    // Hreflang tags for Vietnamese (Primary / Default) and x-default fallback
    links.push({ rel: "alternate", hreflang: "vi", href: canonical });
    links.push({ rel: "alternate", hreflang: "vi-VN", href: canonical });
    links.push({ rel: "alternate", hreflang: "x-default", href: canonical });
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
    head.scripts = [
      {
        type: "application/ld+json",
        id: "page-structured-data",
        "data-seo-managed": "true",
        children: JSON.stringify(structuredData),
      },
    ];
  }

  return head;
}
