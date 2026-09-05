import { supabase } from "@/integrations/supabase/client";

export interface ProductReviewItem {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  datePublished: string;
  createdAt?: string | undefined;
}

export interface ProductAggregateRating {
  ratingValue: number;
  reviewCount: number;
}

/**
 * Fetch top approved reviews for a product with buyer profile names
 */
export async function getProductReviews(productId: string, limit = 5): Promise<ProductReviewItem[]> {
  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        buyer_id,
        profiles:buyer_id(full_name)
      `)
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !reviews) {
      return [];
    }

    const mappedReviews: ProductReviewItem[] = reviews.map((r: any) => ({
      id: String(r.id),
      rating: Number(r.rating) || 5,
      comment: String(r.comment || "Sản phẩm chất lượng, đúng mô tả."),
      authorName: String(r.profiles?.full_name || "Người mua"),
      datePublished: r.created_at
        ? new Date(r.created_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      createdAt: r.created_at ? String(r.created_at) : undefined,
    }));

    return mappedReviews;
  } catch (err) {
    console.error("Error fetching product reviews:", err);
    return [];
  }
}

/**
 * Calculate aggregate rating for a product from approved reviews
 */
export async function getAggregateRating(
  productId: string,
  fallbackRating = 0,
  fallbackCount = 0
): Promise<ProductAggregateRating> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_approved", true);

    if (error || !data || data.length === 0) {
      if (fallbackCount > 0 && fallbackRating > 0) {
        return {
          ratingValue: Math.round(Number(fallbackRating) * 10) / 10,
          reviewCount: Number(fallbackCount),
        };
      }
      return { ratingValue: 0, reviewCount: 0 };
    }

    const sum = data.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0);
    const avg = sum / data.length;

    return {
      ratingValue: Math.round(avg * 10) / 10,
      reviewCount: data.length,
    };
  } catch (err) {
    console.error("Error calculating aggregate rating:", err);
    return {
      ratingValue: fallbackRating ? Math.round(Number(fallbackRating) * 10) / 10 : 0,
      reviewCount: fallbackCount || 0,
    };
  }
}

/**
 * Fetch both aggregate rating and reviews in one call
 */
export async function getProductReviewData(
  productId: string,
  fallbackRating = 0,
  fallbackCount = 0,
  limit = 5
): Promise<{
  ratingValue: number;
  reviewCount: number;
  reviews: ProductReviewItem[];
}> {
  try {
    const [reviews, aggregate] = await Promise.all([
      getProductReviews(productId, limit),
      getAggregateRating(productId, fallbackRating, fallbackCount),
    ]);

    // If aggregate has 0 reviews but reviews list returned items
    let ratingValue = aggregate.ratingValue;
    let reviewCount = aggregate.reviewCount;

    if (reviewCount === 0 && reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
      ratingValue = Math.round((sum / reviews.length) * 10) / 10;
      reviewCount = reviews.length;
    }

    return {
      ratingValue,
      reviewCount,
      reviews,
    };
  } catch (err) {
    console.error("Error in getProductReviewData:", err);
    return {
      ratingValue: fallbackRating ? Math.round(Number(fallbackRating) * 10) / 10 : 0,
      reviewCount: fallbackCount || 0,
      reviews: [],
    };
  }
}
