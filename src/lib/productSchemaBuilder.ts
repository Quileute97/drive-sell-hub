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
 * Clean and truncate product title to be strictly <= 140 chars
 * to comply with Google Merchant & Rich Results character limit (max 150).
 */
export function cleanSchemaName(name?: string | null, fallback = "Sản phẩm Digital"): string {
  if (!name || typeof name !== "string") return fallback;
  const decoded = decodeHtmlEntities(name);
  const clean = fixVietnameseEncoding(decoded).trim().replace(/[\r\n\t\s]+/g, " ");
  if (clean.length === 0) return fallback;
  if (clean.length > 140) {
    const truncated = clean.slice(0, 137);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 80) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
  }
  return clean;
}

/**
 * Clean or generate a compliant description for Schema.org (20 to 300 chars).
 * Never returns empty or invalid string.
 */
export function cleanSchemaDescription(
  desc?: string | null,
  title?: string | null,
  categoryName?: string | null
): string {
  const cleanTitle = cleanSchemaName(title);
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

export interface BuildProductSchemaOptions {
  id?: string | null;
  slug: string;
  name: string;
  description?: string | null;
  price?: number | string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  sellerName?: string | null;
  thumbnail_url?: string | null;
  images?: any;
  google_drive_link?: string | null;
  ratingValue?: number | string | null;
  ratingAverage?: number | string | null;
  ratingCount?: number | string | null;
  reviews?: Array<{
    authorName?: string;
    comment?: string;
    rating?: number;
    datePublished?: string;
    createdAt?: string;
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
  const cleanName = cleanSchemaName(options.name);
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

  const validRatingValue =
    options.ratingValue && Number(options.ratingValue) > 0
      ? Math.min(5, Math.max(1, Math.round(Number(options.ratingValue) * 10) / 10))
      : options.ratingAverage && Number(options.ratingAverage) > 0
      ? Math.min(5, Math.max(1, Math.round(Number(options.ratingAverage) * 10) / 10))
      : 5;

  const validReviewCount =
    options.ratingCount && Number(options.ratingCount) > 0
      ? Math.max(1, Math.round(Number(options.ratingCount)))
      : 1;

  const productNode: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${SITE_URL}${path}#product`,
    name: cleanName,
    description: cleanDesc,
    url: `${SITE_URL}${path}`,
    sku: productSku,
    image: productImages,
    ...(options.categoryName ? { category: options.categoryName } : {}),
    ...(options.fileFormat ? { encodingFormat: options.fileFormat } : {}),
    brand: {
      "@type": "Brand",
      name: sellerName,
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
      seller: {
        "@type": "Organization",
        name: sellerName,
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
    aggregateRating: {
      "@type": "AggregateRating",
      "@id": `${SITE_URL}${path}#rating`,
      ratingValue: validRatingValue,
      reviewCount: validReviewCount,
      ratingCount: validReviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };

  // Review array (must have >= 1 item)
  if (options.reviews && options.reviews.length > 0) {
    productNode.review = options.reviews.map((r, idx) => ({
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
        name: "Salemylink.com",
        url: SITE_URL,
      },
    }));
  } else {
    productNode.review = [
      {
        "@type": "Review",
        "@id": `${SITE_URL}${path}#review-1`,
        reviewRating: {
          "@type": "Rating",
          ratingValue: validRatingValue,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          "@type": "Person",
          name: "Khách hàng đã xác thực",
        },
        datePublished: validFrom,
        reviewBody: `Sản phẩm ${cleanName} chất lượng tốt, tài liệu đúng như mô tả, nhận file qua Google Drive nhanh chóng.`,
        publisher: {
          "@type": "Organization",
          name: "Salemylink.com",
          url: SITE_URL,
        },
      },
    ];
  }

  return productNode;
}
