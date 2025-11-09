import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Eye, ArrowLeft, Share2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductReviews } from "@/components/ProductReviews";
import { useCart } from "@/hooks/useCart";

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number;
  thumbnail_url: string;
  images: string[];
  download_count: number;
  view_count: number;
  rating_average: number;
  rating_count: number;
  file_size: string;
  file_format: string;
  tags: string[];
  seller_id: string;
  category_id: string;
  google_drive_link: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  categories: {
    name: string;
  };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct();
      incrementViewCount();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey(full_name, avatar_url),
          categories(name)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin sản phẩm",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase
        .from('products')
        .update({ view_count: (product?.view_count || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const getGoogleDrivePreviewUrl = (driveUrl: string) => {
    // Convert Google Drive view URL to preview URL for embedding
    const fileIdMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    return driveUrl;
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product.id);
      navigate('/cart');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    // Try using Web Share API first (mobile friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.short_description || product?.description,
          url: url,
        });
        toast({
          title: "Thành công",
          description: "Đã chia sẻ sản phẩm",
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or error:', error);
      }
    } else {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Đã sao chép",
          description: "Link sản phẩm đã được sao chép vào clipboard",
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể sao chép link",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
          <Button onClick={() => navigate('/')}>
            Quay về trang chủ
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Preview */}
          <div className="space-y-4">
            {/* Preview Header */}
            <div className="flex border-b">
              <div className="px-4 py-2 font-medium border-b-2 border-primary text-primary">
                Xem trước
              </div>
            </div>

            {/* Preview Content */}
            <div className="aspect-square rounded-lg overflow-hidden relative">
              {product.google_drive_link ? (
                // Google Drive Preview with overlay to prevent opening in new tab
                <div className="w-full h-full relative">
                  <iframe
                    src={getGoogleDrivePreviewUrl(product.google_drive_link)}
                    className="w-full h-full"
                    frameBorder="0"
                    title={`Xem trước ${product.title}`}
                    sandbox="allow-same-origin allow-scripts"
                    allowFullScreen
                  />
                  {/* Invisible overlay to prevent clicks on iframe links */}
                  <div 
                    className="absolute inset-0 pointer-events-auto"
                    style={{ 
                      background: 'transparent',
                      zIndex: 1
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ) : (
                // Fallback to thumbnail if no preview
                <img
                  src={product.thumbnail_url || "/placeholder.svg"}
                  alt={`${product.title} - ${product.categories?.name} - Sản phẩm digital`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            {/* Preview Note */}
            {product.google_drive_link && (
              <p className="text-sm text-muted-foreground text-center">
                Đây là bản xem trước tài liệu. Mua sản phẩm để tải về phiên bản đầy đủ.
              </p>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.categories?.name}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-muted-foreground">{product.short_description}</p>
            </div>

            {/* Rating and Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                {renderStars(product.rating_average || 0)}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({product.rating_count || 0} đánh giá)
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Download className="h-4 w-4 mr-1" />
                {product.download_count} lượt tải
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                {product.view_count} lượt xem
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </div>
              {product.original_price > product.price && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <Badge className="bg-red-500">
                    Giảm {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Details */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Thông tin sản phẩm</h3>
                <div className="space-y-2 text-sm">
                  {product.file_size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dung lượng:</span>
                      <span>{product.file_size}</span>
                    </div>
                  )}
                  {product.file_format && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Định dạng:</span>
                      <span>{product.file_format}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Người bán</h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={product.profiles?.avatar_url || "/placeholder.svg"}
                    alt={product.profiles?.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{product.profiles?.full_name || 'Ẩn danh'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => addToCart(product.id)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Thêm vào giỏ
                </Button>
                <Button 
                  size="lg"
                  onClick={handleBuyNow}
                >
                  Mua ngay - {formatPrice(product.price)}
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        <article className="mt-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Mô tả sản phẩm</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        <RelatedProducts 
          categoryId={product.category_id} 
          currentProductId={product.id} 
        />
      </main>

      <Footer />
      
      {/* Product Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.title,
          "description": product.description,
          "image": product.thumbnail_url,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": product.profiles?.full_name || "Salemylink.com"
            }
          },
          "aggregateRating": product.rating_count > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating_average,
            "reviewCount": product.rating_count
          } : undefined,
          "category": product.categories?.name
        })
      }} />
    </div>
  );
}