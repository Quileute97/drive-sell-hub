import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dfalphamyvdfewixrnju.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzUwODksImV4cCI6MjA3MTYxMTA4OX0.1Jq2r7Y57ZgeeHcbEwpRQI_5pwAkBl3CPpinHgL__e0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Review helper functions mirroring src/lib/reviews.ts
async function getProductReviews(productId, limit = 5) {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`id, rating, comment, created_at, buyer_id, profiles:buyer_id(full_name)`)
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !reviews) return [];
  return reviews.map((r) => ({
    id: String(r.id),
    rating: Number(r.rating) || 5,
    comment: String(r.comment || "Sản phẩm chất lượng, đúng mô tả."),
    authorName: String(r.profiles?.full_name || "Người mua"),
    datePublished: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  }));
}

async function getAggregateRating(productId, fallbackRating = 0, fallbackCount = 0) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  if (error || !data || data.length === 0) {
    if (fallbackCount > 0 && fallbackRating > 0) {
      return {
        ratingValue: Math.round(Number(fallbackRating) * 10) / 10,
        reviewCount: Math.round(Number(fallbackCount)),
      };
    }
    return { ratingValue: 0, reviewCount: 0 };
  }

  const sum = data.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
  const avg = sum / data.length;
  return {
    ratingValue: Math.round(avg * 10) / 10,
    reviewCount: data.length,
  };
}

async function getProductReviewData(productId, fallbackRating = 0, fallbackCount = 0, limit = 5) {
  const [reviews, aggregate] = await Promise.all([
    getProductReviews(productId, limit),
    getAggregateRating(productId, fallbackRating, fallbackCount),
  ]);

  let ratingValue = aggregate.ratingValue;
  let reviewCount = aggregate.reviewCount;
  if (reviewCount === 0 && reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    ratingValue = Math.round((sum / reviews.length) * 10) / 10;
    reviewCount = reviews.length;
  }
  return { ratingValue, reviewCount, reviews };
}

function buildProductSchema(loaderData, slug) {
  const SITE_URL = 'https://salemylink.com';
  const path = `/product/${slug}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: loaderData.name,
    description: loaderData.description,
    url: `${SITE_URL}${path}`,
    sku: slug,
    offers: {
      "@type": "Offer",
      price: loaderData.price,
      priceCurrency: "VND",
    },
    ...(loaderData.ratingCount && loaderData.ratingCount > 0 && loaderData.rating && loaderData.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Math.round(Number(loaderData.rating) * 10) / 10,
            reviewCount: Math.round(Number(loaderData.ratingCount)),
            bestRating: 5,
            worstRating: 1,
          },
          ...(loaderData.reviews && loaderData.reviews.length > 0
            ? {
                review: loaderData.reviews.map((r) => ({
                  "@type": "Review",
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: r.rating || 5,
                    bestRating: 5,
                    worstRating: 1,
                  },
                  author: {
                    "@type": "Person",
                    name: r.authorName || "Người mua",
                  },
                  datePublished: r.datePublished,
                  reviewBody: r.comment || "Sản phẩm chất lượng, đúng mô tả.",
                })),
              }
            : {}),
        }
      : {}),
  };
  return productSchema;
}

async function runTests() {
  console.log('=== TEST 1: PRODUCT WITH 0 REVIEWS (suy-than-cap-mpv2jprp) ===');
  const { data: prod0 } = await supabase
    .from('products')
    .select('id, title, slug, rating_average, rating_count, price')
    .eq('slug', 'suy-than-cap-mpv2jprp')
    .single();

  const reviewData0 = await getProductReviewData(
    prod0.id,
    Number(prod0.rating_average) || 0,
    Number(prod0.rating_count) || 0
  );
  console.log('Review Data 0:', reviewData0);
  const schema0 = buildProductSchema({
    name: prod0.title,
    description: 'Mô tả',
    price: prod0.price,
    rating: reviewData0.ratingValue,
    ratingCount: reviewData0.reviewCount,
    reviews: reviewData0.reviews,
  }, prod0.slug);

  console.log('Schema 0 has aggregateRating?', 'aggregateRating' in schema0);
  console.log('Schema 0 has review?', 'review' in schema0);
  if (!('aggregateRating' in schema0) && !('review' in schema0)) {
    console.log('✅ TEST 1 PASSED: No aggregateRating or review rendered when reviewCount === 0');
  } else {
    console.error('❌ TEST 1 FAILED');
  }

  console.log('\n=== TEST 2: PRODUCT WITH REVIEWS (tai-lieu-on-thi-tuyen-sinh-vao-lop-10-mon-tieng-anhpdf) ===');
  const { data: prod1 } = await supabase
    .from('products')
    .select('id, title, slug, rating_average, rating_count, price')
    .eq('slug', 'tai-lieu-on-thi-tuyen-sinh-vao-lop-10-mon-tieng-anhpdf')
    .single();

  const reviewData1 = await getProductReviewData(
    prod1.id,
    Number(prod1.rating_average) || 0,
    Number(prod1.rating_count) || 0
  );
  console.log('Review Data 1:', reviewData1);
  const schema1 = buildProductSchema({
    name: prod1.title,
    description: 'Mô tả',
    price: prod1.price,
    rating: reviewData1.ratingValue,
    ratingCount: reviewData1.reviewCount,
    reviews: reviewData1.reviews,
  }, prod1.slug);

  console.log('Schema 1 aggregateRating:', schema1.aggregateRating);
  console.log('Schema 1 review count:', schema1.review?.length);
  if (schema1.aggregateRating && schema1.aggregateRating.ratingValue > 0 && schema1.aggregateRating.reviewCount > 0 && schema1.review?.length > 0) {
    console.log('✅ TEST 2 PASSED: Valid positive aggregateRating and review rendered for product with reviews');
  } else {
    console.error('❌ TEST 2 FAILED');
  }

  console.log('\n=== TEST 3: SITEMAP ACCURACY ===');
  const sitemapXml = fs.readFileSync('public/sitemap.xml', 'utf-8');
  const locs = (sitemapXml.match(/<loc>.*?<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, ''));
  
  const totalLoc = locs.length;
  const productLoc = locs.filter(l => l.includes('/product/')).length;
  const nguoiBanLoc = locs.filter(l => l.includes('/nguoi-ban')).length;
  const huongDanLoc = locs.filter(l => l.includes('/huong-dan')).length;

  console.log(`Total <loc>: ${totalLoc} (expected >= 900) -> ${totalLoc >= 900 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`salemylink.com/product: ${productLoc} (expected >= 800) -> ${productLoc >= 800 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`salemylink.com/nguoi-ban: ${nguoiBanLoc} (expected >= 30) -> ${nguoiBanLoc >= 30 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`salemylink.com/huong-dan: ${huongDanLoc} (expected >= 10) -> ${huongDanLoc >= 10 ? '✅ PASS' : '❌ FAIL'}`);
}

runTests().catch(console.error);
