import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const VIETNAMESE_NAMES = [
  "Nguyễn Văn An", "Trần Thị Mai", "Lê Hoàng Long", "Phạm Minh Tuấn",
  "Hoàng Thu Trang", "Đỗ Đức Thắng", "Vũ Hải Đăng", "Bùi Thị Ngọc",
  "Đặng Quốc Bảo", "Ngô Phương Linh", "Dương Văn Hùng", "Lý Thanh Hà",
  "Trịnh Hoài Nam", "Phan Anh Quân", "Mai Thị Cẩm Nhung", "Hồ Minh Quân",
  "Lê Ngọc Ánh", "Nguyễn Đình Trọng", "Trần Thúy Vy", "Vũ Minh Khang"
];

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

async function main() {
  console.log("Fetching active products...");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, title, price, slug")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (prodErr || !products || products.length === 0) {
    console.error("Failed to fetch products:", prodErr);
    return;
  }

  console.log(`Found ${products.length} products to evaluate for reviews.`);

  // Get available profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .limit(30);

  const profileIds = (profiles && profiles.length > 0)
    ? profiles.map(p => p.id)
    : [];

  let seededCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Check existing reviews
    const { count } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("product_id", product.id);

    if (count && count > 0) {
      console.log(`Product "${product.title}" already has ${count} reviews. Skipping.`);
      continue;
    }

    // Determine 1-2 reviews per product
    const numReviews = (i % 3 === 0) ? 2 : 1;
    const newReviews = [];

    for (let r = 0; r < numReviews; r++) {
      const isFiveStar = Math.random() < 0.75; // 75% 5-star, 25% 4-star
      const rating = isFiveStar ? 5 : 4;
      const commentIndex = (i * 2 + r) % SAMPLE_COMMENTS.length;
      const comment = SAMPLE_COMMENTS[commentIndex];
      const buyerId = profileIds.length > 0 ? profileIds[(i + r) % profileIds.length] : null;

      // Random date in last 30 days
      const daysAgo = Math.floor(Math.random() * 28) + 1;
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
      seededCount += newReviews.length;
      
      // Update product rating_average and rating_count
      const avg = newReviews.reduce((sum, item) => sum + item.rating, 0) / newReviews.length;
      await supabase
        .from("products")
        .update({
          rating_average: Number(avg.toFixed(1)),
          rating_count: newReviews.length,
        })
        .eq("id", product.id);

      console.log(`[+] Seeded ${newReviews.length} reviews for: ${product.title.slice(0, 40)}...`);
    }

    if (seededCount >= 55) {
      break;
    }
  }

  console.log(`\n🎉 Finished seeding ${seededCount} reviews successfully!`);
}

main().catch(err => {
  console.error("Seeding error:", err);
});
