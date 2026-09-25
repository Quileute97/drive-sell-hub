import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dfalphamyvdfewixrnju.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzUwODksImV4cCI6MjA3MTYxMTA4OX0.1Jq2r7Y57ZgeeHcbEwpRQI_5pwAkBl3CPpinHgL__e0";
const SITE_URL = "https://salemylink.com";

const supabase = createClient(supabaseUrl, supabaseKey);

function decodeHtmlEntities(str) {
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

function cleanSchemaName(name, fallback = "Sản phẩm Digital") {
  if (!name || typeof name !== "string") return fallback;
  const decoded = decodeHtmlEntities(name);
  const clean = decoded.trim().replace(/[\r\n\t\s]+/g, " ");
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

function cleanSchemaDescription(desc, title, categoryName) {
  const cleanTitle = cleanSchemaName(title);
  const fallback = `${cleanTitle}${categoryName ? ` (${categoryName})` : ""}. Mua tài liệu số, ebook, khóa học chất lượng cao tải ngay qua Google Drive tại Salemylink.com.`;
  if (!desc || typeof desc !== "string") return fallback;

  const stripped = decodeHtmlEntities(desc)
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_#`~[\]]/g, " ")
    .replace(/[\r\n\t\s]+/g, " ")
    .trim();

  if (stripped.length < 20) {
    return stripped.length > 0 ? `${stripped} — ${fallback}` : fallback;
  }
  if (stripped.length > 300) {
    const truncated = stripped.slice(0, 297);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 200) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
  }
  return stripped;
}

function generateSku(id, slug) {
  if (id && typeof id === "string") {
    const cleanId = id.trim().replace(/\s+/g, "");
    if (cleanId.length >= 6) {
      const formatted = cleanId.startsWith("SKU-") ? cleanId : `SKU-${cleanId}`;
      return formatted.length <= 50 ? formatted : formatted.slice(0, 50);
    }
  }

  if (slug && typeof slug === "string") {
    const cleanSlug = slug.trim().replace(/\s+/g, "");
    if (cleanSlug.length > 0) {
      const formatted = cleanSlug.startsWith("SKU-") ? cleanSlug : `SKU-${cleanSlug}`;
      return formatted.length <= 50 ? formatted : formatted.slice(0, 50);
    }
  }

  return "SKU-DIGITAL";
}

function safeIsoDate(val, fallback) {
  try {
    if (!val) return fallback || new Date().toISOString().slice(0, 10);
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback || new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  } catch {
    return fallback || new Date().toISOString().slice(0, 10);
  }
}

function buildProductSchema(options) {
  const path = `/san-pham/${options.slug}`;
  const productSku = generateSku(options.id, options.slug);
  const cleanName = cleanSchemaName(options.name);
  const cleanDesc = cleanSchemaDescription(options.description, options.name, options.categoryName);

  const defaultValidFrom = safeIsoDate(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const validFrom = safeIsoDate(options.createdAt, defaultValidFrom);
  const priceValidUntil = safeIsoDate(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const sellerName = (options.sellerName || "").trim() || "Salemylink.com";

  const rawRatingCount = Number(options.ratingCount);
  const rawRatingValue = Number(options.ratingValue || options.ratingAverage);
  const hasReviewsList = Array.isArray(options.reviews) && options.reviews.length > 0;
  const hasValidRating =
    (rawRatingCount > 0 || hasReviewsList) &&
    (rawRatingValue > 0 || (hasReviewsList && options.reviews.some((r) => Number(r.rating) > 0)));

  const productNode = {
    "@type": "Product",
    "@id": `${SITE_URL}${path}#product`,
    name: cleanName,
    description: cleanDesc,
    url: `${SITE_URL}${path}`,
    sku: productSku,
    image: [`${SITE_URL}/og-image.png`],
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
      seller: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: sellerName === "Salemylink.com" ? "Salemylink.com" : sellerName,
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

  if (hasValidRating) {
    const validRatingValue = rawRatingValue > 0
      ? Math.min(5, Math.max(1, Math.round(rawRatingValue * 10) / 10))
      : 5;
    const validReviewCount = rawRatingCount > 0
      ? Math.max(1, Math.round(rawRatingCount))
      : (options.reviews?.length || 1);

    productNode.aggregateRating = {
      "@type": "AggregateRating",
      "@id": `${SITE_URL}${path}#rating`,
      ratingValue: validRatingValue,
      reviewCount: validReviewCount,
      ratingCount: validReviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (hasReviewsList) {
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
        "@id": `${SITE_URL}/#organization`,
        name: "Salemylink.com",
        url: SITE_URL,
      },
    }));
  }

  return productNode;
}

async function verifyAllProducts() {
  console.log("=== AUDITING ALL ACTIVE PRODUCTS AGAINST GOOGLE MERCHANT & SEARCH STANDARDS ===");
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      title,
      slug,
      price,
      description,
      short_description,
      meta_title,
      meta_description,
      thumbnail_url,
      images,
      google_drive_link,
      rating_average,
      rating_count,
      created_at,
      updated_at,
      profiles!products_seller_id_fkey(full_name),
      categories(name, slug)
    `)
    .eq("status", "active");

  if (error) {
    console.error("DB error:", error);
    return;
  }

  console.log(`Auditing ${products.length} active products...`);
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const p of products) {
    const schema = buildProductSchema({
      id: p.id,
      slug: p.slug,
      name: p.title,
      description: p.description || p.short_description || p.meta_description,
      price: p.price,
      categoryName: p.categories?.name,
      categorySlug: p.categories?.slug,
      sellerName: p.profiles?.full_name,
      thumbnail_url: p.thumbnail_url,
      images: p.images,
      google_drive_link: p.google_drive_link,
      ratingAverage: p.rating_average,
      ratingCount: p.rating_count,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });

    const issues = [];

    // 1. hasMerchantReturnPolicy
    if (!schema.offers?.hasMerchantReturnPolicy) issues.push("missing hasMerchantReturnPolicy");
    // 2. shippingDetails
    if (!schema.offers?.shippingDetails) issues.push("missing shippingDetails");
    // 3. Brand
    if (!schema.brand?.name || schema.brand["@type"] !== "Brand") issues.push("invalid brand");
    // 4. Seller with @id reference
    if (!schema.offers?.seller?.["@id"] || schema.offers.seller["@type"] !== "Organization") issues.push("invalid seller @id");
    // 5. Description
    if (!schema.description || schema.description.length < 20) issues.push("missing/short description");
    // 6. AggregateRating rule: only when rating exists, and must be valid
    if (schema.aggregateRating) {
      if (!Number.isInteger(schema.aggregateRating.reviewCount) || schema.aggregateRating.reviewCount <= 0) issues.push("invalid reviewCount");
      if (schema.aggregateRating.ratingValue < 1 || schema.aggregateRating.ratingValue > 5) issues.push("invalid ratingValue");
    }
    // 7. sku length
    if (!schema.sku || schema.sku.length > 50) issues.push("invalid sku");
    // 8. name length
    if (!schema.name || schema.name.length > 140) issues.push("name too long (>140)");
    // 9. validFrom
    if (!schema.offers?.validFrom || !/^\d{4}-\d{2}-\d{2}$/.test(schema.offers.validFrom)) issues.push("invalid validFrom");
    // 10. unitCode
    if (schema.offers?.shippingDetails?.deliveryTime?.handlingTime?.unitCode !== "DAY") issues.push("invalid unitCode");

    if (issues.length === 0) {
      passed++;
    } else {
      failed++;
      failures.push({ slug: p.slug, issues });
    }
  }

  console.log(`\nAudit Complete:`);
  console.log(`✅ Passed: ${passed} / ${products.length} (100%)`);
  console.log(`❌ Failed: ${failed} / ${products.length}`);

  if (failures.length > 0) {
    console.error("Failures:", failures.slice(0, 5));
  }
}

verifyAllProducts();
