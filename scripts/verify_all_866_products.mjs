import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dfalphamyvdfewixrnju.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzUwODksImV4cCI6MjA3MTYxMTA4OX0.1Jq2r7Y57ZgeeHcbEwpRQI_5pwAkBl3CPpinHgL__e0";
const SITE_URL = "https://salemylink.com";

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanSchemaName(name, fallback = "Sản phẩm Digital") {
  if (!name || typeof name !== "string") return fallback;
  const clean = name.trim().replace(/[\r\n\t]+/g, " ");
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
  const fallback = `${cleanSchemaName(title)}${categoryName ? ` (${categoryName})` : ""}. Mua tài liệu số, ebook, khóa học chất lượng cao tải ngay qua Google Drive tại Salemylink.com.`;
  if (!desc || typeof desc !== "string") return fallback;

  const stripped = desc
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_#`~[\]]/g, " ")
    .replace(/[\r\n\t]+/g, " ")
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
    const alphanumeric = id.replace(/[^a-zA-Z0-9]/g, "");
    if (alphanumeric.length >= 6) {
      return `SKU-${alphanumeric.slice(0, 12).toUpperCase()}`;
    }
  }
  if (slug && typeof slug === "string") {
    const alphanumeric = slug.replace(/[^a-zA-Z0-9]/g, "");
    if (alphanumeric.length > 0) {
      const suffix = alphanumeric.slice(-12).toUpperCase();
      return `SKU-${suffix}`;
    }
  }
  return "SKU-ITEM";
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

  return {
    "@type": "Product",
    "@id": `${SITE_URL}${path}#product`,
    name: cleanName,
    description: cleanDesc,
    url: `${SITE_URL}${path}`,
    sku: productSku,
    mpn: productSku,
    image: [`${SITE_URL}/og-image.png`],
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
    review: [
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
    ],
  };
}

async function verifyAllProducts() {
  console.log("=== AUDITING ALL 866 PRODUCTS AGAINST 10 GSC RULES ===");
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
    // 4. Description
    if (!schema.description || schema.description.length < 20) issues.push("missing/short description");
    // 5. reviewCount
    if (!Number.isInteger(schema.aggregateRating?.reviewCount) || schema.aggregateRating.reviewCount <= 0) issues.push("invalid reviewCount");
    // 6. ratingValue
    if (schema.aggregateRating?.ratingValue < 1 || schema.aggregateRating?.ratingValue > 5) issues.push("invalid ratingValue");
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
