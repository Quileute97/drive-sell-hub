import { createClient } from "@supabase/supabase-js";
import { normalizeProductName, cleanSchemaDescription, buildProductSchema, buildProductListItem } from "../src/lib/productSchemaBuilder.js";

const supabaseUrl = "https://dfalphamyvdfewixrnju.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzUwODksImV4cCI6MjA3MTYxMTA4OX0.1Jq2r7Y57ZgeeHcbEwpRQI_5pwAkBl3CPpinHgL__e0";
const SITE_URL = "https://salemylink.com";

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateProductHead(slug) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = supabase
    .from("products")
    .select(
      "id, slug, title, short_description, description, price, original_price, thumbnail_url, images, google_drive_link, download_only_link, read_only, meta_title, meta_description, rating_average, rating_count, download_count, view_count, file_size, file_format, tags, seller_id, category_id, created_at, updated_at, status, profiles!products_seller_id_fkey(full_name, avatar_url), categories(id, name, slug)"
    );

  let { data } = isUuid
    ? await query.or(`id.eq.${slug},slug.eq."${slug}"`).maybeSingle()
    : await query.eq("slug", slug).maybeSingle();

  if (!data) {
    // Fallback Product schema
    const fallbackTitle = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const cleanTitle = normalizeProductName(fallbackTitle, "Sản phẩm số");
    const fallbackDesc = `${cleanTitle}. Mua tài liệu số, ebook, khóa học chất lượng cao tải ngay qua Google Drive tại Salemylink.com.`;

    const fallbackProductSchema = buildProductSchema({
      id: null,
      slug: slug,
      name: cleanTitle,
      description: fallbackDesc,
      price: 0,
      sellerName: "Salemylink",
      categoryName: "Sản phẩm số",
    });

    return {
      "@context": "https://schema.org",
      "@graph": [fallbackProductSchema],
    };
  }

  const seller = data.profiles;
  const category = data.categories;

  const desc = data.meta_description || data.short_description || data.description || `${data.title} tải ngay tại Salemylink.`;

  const productSchema = buildProductSchema({
    id: data.id,
    slug: data.slug,
    name: data.title,
    description: desc,
    price: data.price,
    categoryName: category?.name,
    categorySlug: category?.slug,
    sellerName: seller?.full_name,
    thumbnail_url: data.thumbnail_url,
    images: data.images,
    google_drive_link: data.google_drive_link,
    ratingValue: data.rating_average,
    ratingAverage: data.rating_average,
    ratingCount: data.rating_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });

  return {
    "@context": "https://schema.org",
    "@graph": [productSchema],
  };
}

async function simulateSellerHead(sellerIdOrSlug) {
  const { data: seller } = await supabase
    .from("profiles")
    .select("user_id, full_name, avatar_url")
    .eq("user_id", sellerIdOrSlug)
    .maybeSingle();

  const sellerName = seller?.full_name || "Người bán uy tín";

  const { data: products } = await supabase
    .from("products")
    .select("id, title, slug, description, short_description, thumbnail_url, images, google_drive_link, price, original_price, rating_average, rating_count, download_count, created_at, updated_at")
    .eq("seller_id", seller?.user_id || sellerIdOrSlug)
    .eq("status", "active")
    .order("download_count", { ascending: false })
    .limit(10);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top sản phẩm nổi bật của ${sellerName}`,
    numberOfItems: (products || []).length,
    itemListElement: (products || []).map((p, i) =>
      buildProductListItem({
        position: i + 1,
        name: p.title,
        slug: p.slug,
        description: p.description || p.short_description,
        thumbnail_url: p.thumbnail_url,
        images: p.images,
        google_drive_link: p.google_drive_link,
        price: p.price,
      })
    ),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [itemList],
  };
}

async function runAuditVerifications() {
  console.log("================================================================================");
  console.log("VÉRIFICATION 1 — Product pages có đầy đủ schema (5 URL đại diện)");
  console.log("================================================================================");

  const testSlugs = [
    "moi-b-ai-22-23-kh-ai-quat-ve-vi-sinh-vat-thuc-hanh-mmrxv8n7",
    "autoclip-mmyycxgr",
    "pdf-su-anh-huong-cua-thuat-toan-topology-informed-pruning-len-hinh-th-ai-va-dac-diem-khuech-tan-cua-bo-cung-af-o-nguoi-truong-thanh-thuan-tay-ph-ai-mmzwmhkx",
    "tai-lieu-hoc-tap",
    "ebook-marketing",
  ];

  for (const slug of testSlugs) {
    console.log(`\n=== /san-pham/${slug} ===`);
    const graph = await simulateProductHead(slug);
    const items = graph["@graph"] || [];
    for (const item of items) {
      if (item && item["@type"] === "Product") {
        const name = String(item.name || "");
        console.log(`  Product name: "${name}" (${name.length} chars)`);
        console.log(`  description: ${item.description ? "PRESENT" : "MISSING"}`);
        const b = item.brand;
        console.log(`  brand: ${typeof b === "object" && b ? b.name : b}`);
        const o = item.offers || {};
        console.log(`  hasMerchantReturnPolicy: ${o.hasMerchantReturnPolicy ? "PRESENT" : "MISSING"}`);
        console.log(`  shippingDetails: ${o.shippingDetails ? "PRESENT" : "MISSING"}`);
        console.log(`  sku: ${item.sku || "MISSING"}`);
        console.log(`  mpn: ${item.mpn || "MISSING"}`);
      }
    }
  }

  console.log("\n================================================================================");
  console.log("VÉRIFICATION 2 — Seller page brand repeated (seller PKX)");
  console.log("================================================================================");

  const sellerGraph = await simulateSellerHead("a5820685-eeeb-42d9-9565-2a14b8183516");
  for (const item of sellerGraph["@graph"] || []) {
    if (item && item["@type"] === "ItemList") {
      const products = item.itemListElement || [];
      console.log(`Total products in ItemList: ${products.length}`);
      const brands = {};
      for (const p of products) {
        const prod = p.item || {};
        if (prod && prod["@type"] === "Product") {
          const b = prod.brand;
          const bn = typeof b === "object" && b ? b.name : b;
          if (bn) {
            brands[bn] = (brands[bn] || 0) + 1;
          }
        }
      }
      if (Object.keys(brands).length > 0) {
        console.log("Brand count in ItemList:");
        for (const [bn, n] of Object.entries(brands)) {
          console.log(`  ${bn}: ${n}`);
        }
      } else {
        console.log("✅ KHÔNG CÓ BRAND TRONG ITEMLIST PRODUCTS (đã loại bỏ)");
      }
    }
  }
}

runAuditVerifications();
