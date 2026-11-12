import { fixVietnameseEncoding } from "./vietnameseText";
import { resolveAllProductImages, resolveProductImage } from "./productImages";
import { generateSku, safeIsoDate } from "./skuUtils";
import { SITE_URL } from "./seoHead";

/**
 * Helper to decode HTML entities before generating schema text.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Chuẩn hóa tên sản phẩm cho JSON-LD Product.name
 * - Loại bỏ prefix format như [PDF], (PDF), [EBOOK], v.v.
 * - Giới hạn max 90 chars (Google hiển thị ~60 chars)
 * - Đảm bảo min ~10 chars (thêm context nếu quá ngắn)
 */
export function normalizeProductName(
  rawName?: string | null,
  categoryName?: string | null,
  fallback = "Sản phẩm Digital — Tải ngay tại Salemylink"
): string {
  if (!rawName || typeof rawName !== "string" || rawName.trim().length === 0) {
    return fallback;
  }

  const decoded = decodeHtmlEntities(rawName);
  let name = fixVietnameseEncoding(decoded).trim().replace(/[\r\n\t\s]+/g, " ");

  // Loại bỏ prefix format phổ biến trong product name
  name = name.replace(/^\[(PDF|EBOOK|PDF Ebook|Khóa học|Ebook|Course|Course Materials|Document|Tài liệu|Source Code|Template)\]\s*/i, "");
  name = name.replace(/^\((PDF|EBOOK|PDF Ebook|Khóa học|Ebook|Course|Course Materials|Document|Tài liệu|Source Code|Template)\)\s*/i, "");

  // Nếu name quá ngắn (dưới 10 chars) và có category, thêm context
  if (name.length < 10 && categoryName) {
    name = `${name} — ${categoryName}`;
  }

  // Final fallback nếu vẫn quá ngắn (< 10 chars)
  if (name.length < 10) {
    name = `${name} — Tải ngay`;
  }

  // Nếu name quá dài, cắt ngắn tại ranh giới từ <= 87 chars + '...'
  if (name.length > 90) {
    const truncated = name.slice(0, 87);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 50) {
      name = truncated.slice(0, lastSpace) + "...";
    } else {
      name = truncated + "...";
    }
  }

  return name;
}

export const cleanSchemaName = normalizeProductName;

/**
 * Clean or generate a compliant description for Schema.org (20 to 300 chars).
 * Never returns empty or invalid string.
 */
export function cleanSchemaDescription(
  desc?: string | null,
  title?: string | null,
  categoryName?: string | null
): string {
  const cleanTitle = normalizeProductName(title, categoryName);
  const fallback = `${cleanTitle}${categoryName ? ` (${categoryName})` : ""}. Mua tài liệu số, ebook, khóa học chất lượng cao tải ngay qua Google Drive tại Salemylink.com.`;
  if (!desc || typeof desc !== "string") return fallback;

  // Strip HTML tags and markdown, decode entities
  const stripped = decodeHtmlEntities(desc)
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_#`~[\]]/g, " ")
    .replace(/[\r\n\t\s]+/g, " ")
    .trim();

  const clean = fixVietnameseEncoding(stripped);
  if (clean.length < 20) {
    return clean.length > 0 ? `${clean} — ${fallback}` : fallback;
  }
  if (clean.length > 300) {
    const truncated = clean.slice(0, 297);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 200) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
  }
  return clean;
}

export interface BuildProductListItemOptions {
  position: number;
  name: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  images?: any;
  google_drive_link?: string | null;
  price?: number | string | null;
  categoryName?: string | null;
}

/**
 * Lightweight ItemList element for CollectionPage, ProfilePage, Tag pages (Option B).
 * Contains minimal Product schema without duplicate brand, shippingDetails, or returnPolicy.
 */
export function buildProductListItem(options: BuildProductListItemOptions) {
  const path = `/san-pham/${options.slug}`;
  const images = resolveAllProductImages({
    thumbnail_url: options.thumbnail_url,
    images: options.images,
    google_drive_link: options.google_drive_link,
  });

  const normName = normalizeProductName(options.name, options.categoryName);
  const normDesc = cleanSchemaDescription(options.description, options.name, options.categoryName);

  return {
    "@type": "ListItem",
    position: options.position,
    item: {
      "@type": "Product",
      "@id": `${SITE_URL}${path}#product`,
      name: normName,
      description: normDesc,
      url: `${SITE_URL}${path}`,
      image: images,
      offers: {
        "@type": "Offer",
        price: String(Number(options.price) || 0),
        priceCurrency: "VND",
      },
    },
  };
}

export interface BuildProductSchemaOptions {
  id?: string | null;
  slug: string;
  name: string;
  description?: string | null;
  price?: number | string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  sellerName?: string | null;
  sellerSlug?: string | null;
  thumbnail_url?: string | null;
  images?: any;
  google_drive_link?: string | null;
  ratingValue?: number | string | null;
  ratingAverage?: number | string | null;
  ratingCount?: number | string | null;
  reviews?: Array<{
    authorName?: string | undefined;
    comment?: string | undefined;
    rating?: number | undefined;
    datePublished?: string | undefined;
    createdAt?: string | undefined;
  }> | null;
  fileFormat?: string | null;
  fileSize?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Unified product schema builder ensuring 100% compliance with Google Search Console
 * Product snippets & Merchant listings.
 */
export function buildProductSchema(options: BuildProductSchemaOptions) {
  const path = `/san-pham/${options.slug}`;
  const productSku = generateSku(options.id, options.slug);
  const cleanName = normalizeProductName(options.name, options.categoryName);
  const cleanDesc = cleanSchemaDescription(options.description, options.name, options.categoryName);

  const defaultValidFrom = safeIsoDate(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const validFrom = safeIsoDate(options.createdAt, defaultValidFrom);
  const priceValidUntil = safeIsoDate(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const productImages = resolveAllProductImages({
    thumbnail_url: options.thumbnail_url,
    images: options.images,
    google_drive_link: options.google_drive_link,
  });

  const sellerName = (options.sellerName || "").trim() || "Salemylink.com";

  // Check if real reviews / rating exist
  const rawRatingCount = Number(options.ratingCount);
  const rawRatingValue = Number(options.ratingValue || options.ratingAverage);
  const hasReviewsList = Array.isArray(options.reviews) && options.reviews.length > 0;
  const hasValidRating =
    (rawRatingCount > 0 || hasReviewsList) &&
    (rawRatingValue > 0 || (hasReviewsList && options.reviews!.some((r) => Number(r.rating) > 0)));

  const productNode: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${SITE_URL}${path}#product`,
    name: cleanName,
    description: cleanDesc,
    url: `${SITE_URL}${path}`,
    sku: productSku,
    mpn: productSku,
    image: productImages,
    ...(options.categoryName ? { category: options.categoryName } : {}),
    ...(options.fileFormat ? { encodingFormat: options.fileFormat } : {}),
    brand: {
      "@type": "Brand",
      name: sellerName || "Salemylink",
    },
    offers: {
      "@type": "Offer",
      "@id": `${SITE_URL}${path}#offer`,
      price: String(Number(options.price) || 0),
      priceCurrency: "VND",
      validFrom,
      priceValidUntil,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `${SITE_URL}${path}`,
      seller:
        sellerName !== "Salemylink.com" && options.sellerSlug
          ? {
              "@type": "Person",
              "@id": `${SITE_URL}/nguoi-ban/${options.sellerSlug}#seller`,
              name: sellerName,
              url: `${SITE_URL}/nguoi-ban/${options.sellerSlug}`,
            }
          : {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Salemylink.com",
              url: SITE_URL,
            },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "VN",
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "VND",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "VN",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        merchantReturnDays: 0,
        returnMethod: "https://schema.org/ReturnNotPermitted",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
    },
  };

  // Only attach aggregateRating if the product actually has positive rating & review count >= 1
  if (hasValidRating) {
    const validRatingValue = rawRatingValue > 0
      ? Math.min(5, Math.max(1, Math.round(rawRatingValue * 10) / 10))
      : 5;
    const validReviewCount = rawRatingCount > 0
      ? Math.max(1, Math.round(rawRatingCount))
      : (options.reviews?.length || 1);

    productNode["aggregateRating"] = {
      "@type": "AggregateRating",
      "@id": `${SITE_URL}${path}#rating`,
      ratingValue: validRatingValue,
      reviewCount: validReviewCount,
      ratingCount: validReviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Only attach review array if real reviews exist (never insert fake placeholder reviews)
  if (hasReviewsList) {
    productNode["review"] = options.reviews!.map((r, idx) => ({
      "@type": "Review",
      "@id": `${SITE_URL}${path}#review-${idx + 1}`,
      reviewRating: {
        "@type": "Rating",
        ratingValue: Math.min(5, Math.max(1, Number(r.rating) || 5)),
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        "@type": "Person",
        name: r.authorName || "Khách hàng",
      },
      datePublished: safeIsoDate(r.datePublished || r.createdAt, validFrom),
      reviewBody: r.comment || `Đánh giá ${r.rating || 5} sao cho sản phẩm.`,
      publisher: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Salemylink.com",
        url: SITE_URL,
      },
    }));
  }

  return productNode;
}
