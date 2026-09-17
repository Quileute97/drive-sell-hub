import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dfalphamyvdfewixrnju.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzUwODksImV4cCI6MjA3MTYxMTA4OX0.1Jq2r7Y57ZgeeHcbEwpRQI_5pwAkBl3CPpinHgL__e0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log("=== CHECKING ALL ACTIVE PRODUCTS IN DATABASE ===");
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
      profiles!products_seller_id_fkey(full_name),
      categories(name, slug)
    `)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  console.log(`Total active products: ${products?.length || 0}`);

  const issues = {
    emptyTitle: 0,
    titleTooLong: 0,
    emptyDesc: 0,
    emptyImages: 0,
    invalidRating: 0,
    zeroReviewCount: 0,
    invalidPrice: 0,
  };

  const sampleLongTitles = [];

  for (const p of products || []) {
    const title = (p.title || "").trim();
    if (!title) issues.emptyTitle++;
    if (title.length > 150) {
      issues.titleTooLong++;
      if (sampleLongTitles.length < 5) sampleLongTitles.push({ id: p.id, title, length: title.length });
    }

    const desc = (p.description || p.short_description || p.meta_description || "").trim();
    if (!desc) issues.emptyDesc++;

    const ratingAvg = Number(p.rating_average);
    if (isNaN(ratingAvg) || ratingAvg < 0 || ratingAvg > 5) issues.invalidRating++;

    const ratingCount = Number(p.rating_count);
    if (isNaN(ratingCount) || ratingCount < 0) issues.zeroReviewCount++;

    const price = Number(p.price);
    if (isNaN(price) || price < 0) issues.invalidPrice++;
  }

  console.log("Audit Results:", JSON.stringify(issues, null, 2));
  if (sampleLongTitles.length > 0) {
    console.log("Sample long titles:", sampleLongTitles);
  }
}

runAudit();
