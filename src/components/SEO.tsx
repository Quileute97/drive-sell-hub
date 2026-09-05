import { useEffect } from 'react';
import { useLocation } from '@/lib/router-compat';
import { useLanguage } from '@/contexts/LanguageContext';

export const SITE_URL = 'https://salemylink.com';

interface SEOProps {
  title?: string | undefined;
  description?: string | undefined;
  keywords?: string | undefined;
  image?: string | undefined;
  url?: string | undefined;
  type?: 'website' | 'product' | 'article' | undefined;
  structuredData?: object | object[] | undefined;
  noindex?: boolean | undefined;
  publishedTime?: string | undefined;
  modifiedTime?: string | undefined;
  author?: string | undefined;
  // Social overrides
  ogTitle?: string | undefined;
  ogDescription?: string | undefined;
  twTitle?: string | undefined;
  twDescription?: string | undefined;
  // Product-specific props
  productPrice?: number | undefined;
  productCurrency?: string | undefined;
  productAvailability?: 'InStock' | 'OutOfStock' | 'PreOrder' | undefined;
  productBrand?: string | undefined;
  productCategory?: string | undefined;
  productRating?: number | undefined;
  productReviewCount?: number | undefined;
}

type MetaSpec =
  | { kind: 'meta-name'; key: string; content: string }
  | { kind: 'meta-property'; key: string; content: string }
  | { kind: 'meta-http-equiv'; key: string; content: string };

const SEO_ATTR = 'data-seo-managed';

function upsertMeta(spec: MetaSpec) {
  const attr = spec.kind === 'meta-name' ? 'name' : spec.kind === 'meta-property' ? 'property' : 'http-equiv';
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${spec.key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, spec.key);
    el.setAttribute(SEO_ATTR, 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('content', spec.content);
}

function upsertLink(rel: string, href: string, hrefLang?: string) {
  const selector = hrefLang
    ? `link[rel="${rel}"][hreflang="${hrefLang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hrefLang) el.hreflang = hrefLang;
    el.setAttribute(SEO_ATTR, 'true');
    document.head.appendChild(el);
  }
  el.href = href;
}

export const SEO = ({
  title = "Salemylink - Marketplace sản phẩm Digital Việt Nam",
  description = "Marketplace sản phẩm digital Việt Nam. Mua bán ebook, tài liệu, khóa học qua Google Drive an toàn, nhanh chóng.",
  keywords = "bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, thương mại điện tử, marketplace digital, bán tài liệu online",
  image = `${SITE_URL}/og-image.png`,
  url,
  type = "website",
  structuredData,
  noindex = false,
  publishedTime,
  modifiedTime,
  author,
  ogTitle,
  ogDescription,
  twTitle,
  twDescription,
  productPrice,
  productCurrency = "VND",
  productAvailability = "InStock",
  productBrand,
  productCategory,
}: SEOProps) => {
  const location = useLocation();
  const { language, langMeta } = useLanguage();

  // Clean path without query parameters for canonical
  const cleanPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '');
  const canonicalUrl = url || `${SITE_URL}${cleanPath}`;

  const fullTitle = title.includes('Salemylink') ? title : `${title} | Salemylink`;

  // Ensure description is within optimal length (150-160 chars)
  const clamp = (s: string) => (s.length > 160 ? s.substring(0, 157) + '...' : s);
  const optimizedDescription = clamp(description);
  const socialTitle = ogTitle || fullTitle;
  const socialDescription = clamp(ogDescription || description);
  const twitterTitle = twTitle || socialTitle;
  const twitterDescription = clamp(twDescription || ogDescription || description);

  const structuredDataJson = structuredData ? JSON.stringify(structuredData) : undefined;

  useEffect(() => {
    document.title = fullTitle;
    document.documentElement.lang = language || 'vi';

    const robots = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    const metas: MetaSpec[] = [
      { kind: 'meta-name', key: 'description', content: optimizedDescription },
      { kind: 'meta-name', key: 'keywords', content: keywords },
      { kind: 'meta-name', key: 'robots', content: robots },
      { kind: 'meta-name', key: 'googlebot', content: robots },
      { kind: 'meta-name', key: 'bingbot', content: robots },
      { kind: 'meta-name', key: 'baiduspider', content: robots },
      { kind: 'meta-name', key: 'yandexbot', content: robots },
      { kind: 'meta-property', key: 'og:type', content: type === 'product' ? 'product' : type },
      { kind: 'meta-property', key: 'og:url', content: canonicalUrl },
      { kind: 'meta-property', key: 'og:title', content: socialTitle },
      { kind: 'meta-property', key: 'og:description', content: socialDescription },
      { kind: 'meta-property', key: 'og:image', content: image },
      { kind: 'meta-property', key: 'og:image:width', content: '1200' },
      { kind: 'meta-property', key: 'og:image:height', content: '630' },
      { kind: 'meta-property', key: 'og:image:alt', content: title },
      { kind: 'meta-property', key: 'og:locale', content: langMeta?.ogLocale || 'vi_VN' },
      { kind: 'meta-property', key: 'og:site_name', content: 'Salemylink.com' },
      { kind: 'meta-name', key: 'twitter:card', content: 'summary_large_image' },
      { kind: 'meta-name', key: 'twitter:url', content: canonicalUrl },
      { kind: 'meta-name', key: 'twitter:title', content: twitterTitle },
      { kind: 'meta-name', key: 'twitter:description', content: twitterDescription },
      { kind: 'meta-name', key: 'twitter:image', content: image },
      { kind: 'meta-name', key: 'twitter:image:alt', content: title },
      { kind: 'meta-name', key: 'twitter:site', content: '@salemylink' },
      { kind: 'meta-name', key: 'twitter:creator', content: '@salemylink' },
      { kind: 'meta-name', key: 'author', content: author || 'Salemylink.com' },
      { kind: 'meta-name', key: 'publisher', content: 'Salemylink.com' },
      { kind: 'meta-name', key: 'language', content: 'Vietnamese, English, Chinese, Spanish' },
      { kind: 'meta-http-equiv', key: 'content-language', content: 'vi, en, zh, es' },
    ];

    if (type === 'product' && productPrice) {
      metas.push(
        { kind: 'meta-property', key: 'product:price:amount', content: productPrice.toString() },
        { kind: 'meta-property', key: 'product:price:currency', content: productCurrency },
        { kind: 'meta-property', key: 'product:availability', content: productAvailability.toLowerCase() },
        { kind: 'meta-name', key: 'twitter:label1', content: 'Giá' },
        {
          kind: 'meta-name',
          key: 'twitter:data1',
          content: `${new Intl.NumberFormat(langMeta?.locale || 'vi-VN').format(productPrice)} ${productCurrency}`,
        },
      );
      if (productBrand) metas.push({ kind: 'meta-property', key: 'product:brand', content: productBrand });
      if (productCategory) {
        metas.push(
          { kind: 'meta-property', key: 'product:category', content: productCategory },
          { kind: 'meta-name', key: 'twitter:label2', content: 'Danh mục' },
          { kind: 'meta-name', key: 'twitter:data2', content: productCategory },
        );
      }
    }

    if (publishedTime) metas.push({ kind: 'meta-property', key: 'article:published_time', content: publishedTime });
    if (modifiedTime) metas.push({ kind: 'meta-property', key: 'article:modified_time', content: modifiedTime });
    if (author) metas.push({ kind: 'meta-property', key: 'article:author', content: author });

    metas.forEach(upsertMeta);

    if (!noindex) {
      // Canonical link
      upsertLink('canonical', canonicalUrl);

      // Multilingual hreflang alternate links
      const basePath = cleanPath;
      const separator = basePath.includes('?') ? '&' : '?';

      upsertLink('alternate', `${SITE_URL}${basePath}`, 'vi');
      upsertLink('alternate', `${SITE_URL}${basePath}`, 'vi-VN');
      upsertLink('alternate', `${SITE_URL}${basePath}${separator}lang=en`, 'en');
      upsertLink('alternate', `${SITE_URL}${basePath}${separator}lang=en`, 'en-US');
      upsertLink('alternate', `${SITE_URL}${basePath}${separator}lang=zh`, 'zh');
      upsertLink('alternate', `${SITE_URL}${basePath}${separator}lang=zh`, 'zh-CN');
      upsertLink('alternate', `${SITE_URL}${basePath}${separator}lang=es`, 'es');
      upsertLink('alternate', `${SITE_URL}${basePath}${separator}lang=es`, 'es-ES');
      upsertLink('alternate', `${SITE_URL}${basePath}`, 'x-default');
    }

    // Structured data (JSON-LD)
    const existingLd = document.head.querySelector<HTMLScriptElement>(`script[type="application/ld+json"][${SEO_ATTR}]`);
    if (structuredDataJson) {
      const script = existingLd ?? (() => {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.setAttribute(SEO_ATTR, 'true');
        document.head.appendChild(s);
        return s;
      })();
      script.textContent = structuredDataJson;
    } else if (existingLd) {
      existingLd.remove();
    }
  }, [
    fullTitle,
    optimizedDescription,
    keywords,
    canonicalUrl,
    cleanPath,
    noindex,
    type,
    image,
    title,
    socialTitle,
    socialDescription,
    twitterTitle,
    twitterDescription,
    author,
    publishedTime,
    modifiedTime,
    productPrice,
    productCurrency,
    productAvailability,
    productBrand,
    productCategory,
    structuredDataJson,
    language,
    langMeta,
  ]);

  return null;
};
