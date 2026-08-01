import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    checkUserStatus();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          is_verified_purchase,
          created_at,
          profiles!reviews_buyer_id_fkey(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data || []) as any);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (!user) return;

      // Check if user has purchased this product
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .eq('status', 'paid')
        .limit(1);

      setUserHasPurchased((orders && orders.length > 0) || false);

      // Check if user already has a review
      const { data: existingReview } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          is_verified_purchase,
          created_at,
          profiles!reviews_buyer_id_fkey(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .maybeSingle();

      if (existingReview) {
        setUserReview(existingReview as any);
        setRating(existingReview.rating);
        setComment(existingReview.comment || "");
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nhận xét",
        variant: "destructive",
      });
      return;
    }

    // For guest users, require name
    if (!currentUser && !guestName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên của bạn",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      if (currentUser && userReview) {
        // Update existing review for logged-in user
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
          })
          .eq('id', userReview.id);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Đã cập nhật đánh giá của bạn",
        });
      } else {
        // Create new review (for both logged-in and guest users)
        const reviewData: any = {
          product_id: productId,
          rating,
          comment: currentUser ? comment : `[${guestName}] ${comment}`,
          is_verified_purchase: userHasPurchased,
          is_approved: true, // Auto-approve for now, can be changed to false for moderation
        };

        // If user is logged in, add buyer_id
        if (currentUser) {
          reviewData.buyer_id = currentUser.id;
        }

        const { error } = await supabase
          .from('reviews')
          .insert(reviewData);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Cảm ơn bạn đã đánh giá!",
        });
      }

      setShowReviewForm(false);
      setComment("");
      setGuestName("");
      setRating(5);
      fetchReviews();
      checkUserStatus();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onKeyDown={(e) => {
              if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setRating(star);
              }
            }}
            className={`p-0 border-0 bg-transparent ${interactive ? 'cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded' : 'cursor-default'}`}
            aria-label={interactive ? `Đánh giá ${star} sao` : undefined}
          >
            <Star
              className={`h-5 w-5 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/40'
              } ${interactive ? 'hover:scale-110 transition-transform' : ''}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Đánh giá sản phẩm ({reviews.length})
          </h2>
          {!showReviewForm && (
            <Button onClick={() => setShowReviewForm(true)}>
              {userReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            </Button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <Card className="mb-6 border-primary">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">
                {userReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá'}
              </h3>
              
              <div className="space-y-4">
                {/* Guest name field - only show for non-logged users */}
                {!currentUser && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Tên của bạn <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Nhập tên hiển thị..."
                      maxLength={50}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Đánh giá của bạn
                  </label>
                  {renderStars(rating, true)}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nhận xét <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || !comment.trim()}
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setComment(userReview?.comment || "");
                      setRating(userReview?.rating || 5);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chưa có đánh giá nào cho sản phẩm này</p>
              <p className="mt-2">Hãy là người đầu tiên đánh giá!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.profiles?.avatar_url || "/placeholder.svg"}
                      alt={review.profiles?.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">
                            {review.profiles?.full_name || 'Người dùng'}
                            {review.is_verified_purchase && (
                              <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                ✓ Đã mua hàng
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
