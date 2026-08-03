// Shared helper to build TanStack Start route head() metadata (SSR-rendered).
export const SITE_URL = "https://salemylink.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export interface HeadInput {
  title: string;
  description: string;
  path: string; // e.g. "/tag/ielts"
  keywords?: string | string[] | undefined;
  image?: string | undefined;
  type?: "website" | "article" | "product" | undefined;
  noindex?: boolean | undefined;
  ogTitle?: string | undefined;
  ogDescription?: string | undefined;
  twTitle?: string | undefined;
  twDescription?: string | undefined;
  structuredData?: object | object[] | undefined;
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
  } = input;

  const fullTitle = title.includes("Salemylink") ? title : `${title} | Salemylink`;
  const cleanPath = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  const canonical = `${SITE_URL}${cleanPath}`;
  const desc = clamp(description);
  const socialTitle = ogTitle || fullTitle;
  const socialDesc = clamp(ogDescription || description);
  const robots = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: desc },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
    { property: "og:type", content: type },
    { property: "og:url", content: canonical },
    { property: "og:title", content: socialTitle },
    { property: "og:description", content: socialDesc },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: fullTitle },
    { property: "og:locale", content: "vi_VN" },
    { property: "og:site_name", content: "Salemylink.com" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: canonical },
    { name: "twitter:title", content: twTitle || socialTitle },
    { name: "twitter:description", content: clamp(twDescription || ogDescription || description) },
    { name: "twitter:image", content: image },
  ];

  if (keywords) {
    meta.push({
      name: "keywords",
      content: Array.isArray(keywords) ? keywords.join(", ") : keywords,
    });
  }

  const head: {
    meta: Array<Record<string, string>>;
    links: Array<Record<string, string>>;
    scripts?: Array<Record<string, string>>;
  } = {
    meta,
    links: noindex ? [] : [{ rel: "canonical", href: canonical }],
  };

  if (structuredData) {
    head.scripts = [
      { type: "application/ld+json", children: JSON.stringify(structuredData) },
    ];
  }

  return head;
}
