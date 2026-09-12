import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dfalphamyvdfewixrnju.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzUwODksImV4cCI6MjA3MTYxMTA4OX0.1Jq2r7Y57ZgeeHcbEwpRQI_5pwAkBl3CPpinHgL__e0';

const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_COMMENTS = [
  "Tài liệu rất chi tiết và trình bày rõ ràng, áp dụng được ngay vào công việc.",
  "File tải về đầy đủ, font chữ rõ nét, rất đáng tiền. Cảm ơn tác giả!",
  "Nội dung chất lượng cao, đúng như mô tả của shop. Đánh giá 5 sao!",
  "Rất hữu ích cho việc học tập và nghiên cứu, tiết kiệm được nhiều thời gian.",
  "Tải nhanh, hướng dẫn chi tiết, tài liệu cập nhật mới nhất 2026.",
  "Kiến thức thực tế, trình bày mạch lạc, rất hài lòng với chất lượng tài liệu.",
  "Shop hỗ trợ nhanh, tài liệu đúng như giới thiệu. Sẽ tiếp tục ủng hộ shop.",
  "Tài liệu chuẩn, đầy đủ bài tập và lời giải chi tiết, rất dễ hiểu.",
  "Nội dung cô đọng, dễ hiểu, phù hợp cho người đang tự học.",
  "Rất đáng tiền, tài liệu hay và hữu ích cho quá trình ôn luyện.",
  "Nội dung trình bày khoa học, hình ảnh minh họa rõ ràng, đáng 5 sao.",
  "Tài liệu tổng hợp rất đầy đủ và chi tiết, phục vụ tốt cho công việc.",
  "Chất lượng vượt mong đợi, link tải nhanh không bị lỗi.",
  "Mua về học ngay thấy rất hiệu quả, cảm ơn tác giả đã chia sẻ tâm huyết.",
  "Tài liệu rất thực tế, có nhiều case study hữu ích để tham khảo."
];

async function fetchAllProducts() {
  let allProducts = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, slug, rating_average, rating_count")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      allProducts = allProducts.concat(data);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }
  return allProducts;
}

async function main() {
  console.log("Fetching all products...");
  const products = await fetchAllProducts();
  console.log(`Found ${products.length} total products to evaluate.`);

  // Get available profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .limit(50);

  const profileIds = (profiles && profiles.length > 0)
    ? profiles.map(p => p.id)
    : [];

  let updatedProductsCount = 0;
  let seededReviewsCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Check if product already has approved reviews
    const { data: existingReviews } = await supabase
      .from("reviews")
      .select("id, rating")
      .eq("product_id", product.id)
      .eq("is_approved", true);

    if (existingReviews && existingReviews.length > 0) {
      // Ensure product rating_average and rating_count are accurate positive numbers
      const sum = existingReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = Number((sum / existingReviews.length).toFixed(1));
      if (!product.rating_average || product.rating_average <= 0 || !product.rating_count || product.rating_count <= 0) {
        await supabase
          .from("products")
          .update({
            rating_average: Math.min(5, Math.max(1, avg)),
            rating_count: existingReviews.length,
          })
          .eq("id", product.id);
        updatedProductsCount++;
      }
      continue;
    }

    // Seed 1-2 positive reviews for products without reviews
    const numReviews = (i % 3 === 0) ? 2 : 1;
    const newReviews = [];

    for (let r = 0; r < numReviews; r++) {
      const isFiveStar = Math.random() < 0.85; // 85% 5-star, 15% 4-star
      const rating = isFiveStar ? 5 : 4;
      const commentIndex = (i * 3 + r) % SAMPLE_COMMENTS.length;
      const comment = SAMPLE_COMMENTS[commentIndex];
      const buyerId = profileIds.length > 0 ? profileIds[(i + r) % profileIds.length] : null;

      const daysAgo = Math.floor(Math.random() * 25) + 2;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      newReviews.push({
        product_id: product.id,
        ...(buyerId ? { buyer_id: buyerId } : {}),
        rating,
        comment,
        is_verified_purchase: true,
        is_approved: true,
        created_at: createdAt,
      });
    }

    const { error: insertErr } = await supabase
      .from("reviews")
      .insert(newReviews);

    if (insertErr) {
      console.warn(`Could not insert reviews for product ${product.id}:`, insertErr.message);
    } else {
      seededReviewsCount += newReviews.length;
      const avg = Number((newReviews.reduce((sum, item) => sum + item.rating, 0) / newReviews.length).toFixed(1));
      
      await supabase
        .from("products")
        .update({
          rating_average: Math.min(5, Math.max(1, avg)),
          rating_count: newReviews.length,
        })
        .eq("id", product.id);

      updatedProductsCount++;
      if (updatedProductsCount % 50 === 0) {
        console.log(`[+] Processed ${updatedProductsCount} products (${seededReviewsCount} reviews seeded)...`);
      }
    }
  }

  console.log(`\n🎉 Complete! Updated ${updatedProductsCount} products and seeded ${seededReviewsCount} reviews.`);
}

main().catch(err => {
  console.error("Seeding error:", err);
});
