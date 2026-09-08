import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const APPROVED_COMMENTS = [
  "Tài liệu chất lượng, đúng mô tả",
  "Rất hài lòng, sẽ quay lại mua tiếp",
  "Giao hàng nhanh, file đầy đủ",
  "Nội dung hay, đáng giá tiền",
  "Seller uy tín, hỗ trợ nhiệt tình",
  "Tài liệu đẹp, in màu rõ nét",
  "Đúng yêu cầu, không thất vọng",
  "File đầy đủ, giao hàng nhanh",
  "Chất lượng tốt, đáng đồng tiền bát gạo",
  "Sẽ giới thiệu cho bạn bè"
];

async function seed50Reviews() {
  console.log("Fetching products with price > 0...");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, title, price")
    .gt("price", 0)
    .order("created_at", { ascending: false })
    .limit(50);

  if (prodErr || !products || products.length === 0) {
    console.error("Failed to fetch products with price > 0:", prodErr);
    return;
  }

  console.log(`Fetched ${products.length} products with price > 0.`);

  // Fetch buyers from profiles
  let { data: buyers } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, role")
    .eq("role", "buyer")
    .limit(50);

  if (!buyers || buyers.length === 0) {
    console.log("No specific role='buyer' found, fetching general profiles...");
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, user_id, full_name")
      .limit(50);
    buyers = allProfiles || [];
  }

  console.log(`Found ${buyers.length} buyer profiles for attribution.`);
  const buyerIds = buyers.map(b => b.user_id || b.id).filter(Boolean);

  const reviewsToInsert = [];
  const productReviewMap = new Map();

  for (let i = 0; i < 50; i++) {
    const product = products[i % products.length];
    const buyerId = buyerIds.length > 0 ? buyerIds[Math.floor(Math.random() * buyerIds.length)] : null;
    
    // Rating: 70% 5-star, 30% 4-star
    const isFiveStar = Math.random() < 0.7;
    const rating = isFiveStar ? 5 : 4;

    // Pick random comment from approved list
    const comment = APPROVED_COMMENTS[Math.floor(Math.random() * APPROVED_COMMENTS.length)];

    // Random date within past 30 days
    const daysAgo = Math.floor(Math.random() * 29) + 1;
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(Date.now() - (daysAgo * 86400000 + hoursAgo * 3600000)).toISOString();

    const reviewObj = {
      product_id: product.id,
      rating,
      comment,
      is_verified_purchase: true,
      is_approved: true,
      created_at: createdAt,
    };

    if (buyerId) {
      reviewObj.buyer_id = buyerId;
    }

    reviewsToInsert.push(reviewObj);

    if (!productReviewMap.has(product.id)) {
      productReviewMap.set(product.id, []);
    }
    productReviewMap.get(product.id).push(rating);
  }

  console.log(`Inserting ${reviewsToInsert.length} reviews...`);
  const { data: inserted, error: insertErr } = await supabase
    .from("reviews")
    .insert(reviewsToInsert)
    .select();

  if (insertErr) {
    console.error("Error inserting reviews:", insertErr);
    return;
  }

  console.log(`Successfully inserted ${inserted?.length || reviewsToInsert.length} reviews!`);

  // Update rating_average and rating_count for affected products
  console.log("Updating product ratings and review counts...");
  for (const [productId, ratings] of productReviewMap.entries()) {
    // Fetch all approved reviews for this product to compute exact stats
    const { data: allProdReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_approved", true);

    if (allProdReviews && allProdReviews.length > 0) {
      const sum = allProdReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = Math.round((sum / allProdReviews.length) * 10) / 10;
      await supabase
        .from("products")
        .update({
          rating_average: avg,
          rating_count: allProdReviews.length,
        })
        .eq("id", productId);
    }
  }

  // Verification queries
  const { count: totalReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  const { data: productsWithReviews } = await supabase
    .from("reviews")
    .select("product_id")
    .eq("is_approved", true);

  const uniqueProducts = new Set(productsWithReviews?.map(r => r.product_id)).size;

  console.log("\n--- Verification Report ---");
  console.log(`Total reviews in DB: ${totalReviews}`);
  console.log(`Unique products with approved reviews: ${uniqueProducts}`);
  console.log("---------------------------\n");
}

seed50Reviews().catch(console.error);
