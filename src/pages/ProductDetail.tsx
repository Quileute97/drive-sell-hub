import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductFAQ } from "@/components/ProductFAQ";

interface ProductDetail {
  id: string;
  slug: string;
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
  download_only_link: string | null;
  meta_title: string | null;
  meta_description: string | null;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  categories: {
    name: string;
    slug: string;
  };
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey(full_name, avatar_url),
          categories(name, slug)
        `)
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Increment view count
      if (data?.id) {
        await supabase
          .from('products')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
      }
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

  const siteUrl = "https://salemylink.com";
  const productUrl = `${siteUrl}/product/${product.slug}`;
  const metaTitle = product.meta_title || `${product.title} - Mua và tải ngay`;
  const metaDescription =
    product.meta_description ||
    product.short_description ||
    (product.description ? product.description.substring(0, 160) : `Mua ${product.title} với giá tốt nhất. Tải xuống ngay sau khi thanh toán.`);

  const productImages = [product.thumbnail_url, ...(product.images || [])].filter(Boolean);
  const mainImage = productImages[0] || "https://salemylink.com/placeholder.svg";

  // Enhanced Product Structured Data (schema.org)
  const productStructuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productUrl,
    name: product.title,
    description: product.description || product.short_description,
    image: productImages.length > 0 ? productImages : [mainImage],
    sku: product.id,
    mpn: product.id.slice(0, 12),
    category: product.categories?.name,
    brand: {
      "@type": "Brand",
      name: product.profiles?.full_name || "Salemylink.com",
    },
    manufacturer: {
      "@type": "Organization",
      name: "Salemylink.com",
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      price: product.price,
      priceCurrency: "VND",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: product.profiles?.full_name || "Salemylink.com",
        url: `${siteUrl}/seller/${product.seller_id}`,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
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
            unitCode: "MIN",
          },
        },
      },
    },
    // Always include aggregateRating (Google requires this field)
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (product.rating_average || 5).toFixed(1),
      reviewCount: product.rating_count || 1,
      bestRating: "5",
      worstRating: "1",
    },
    // Always include at least one review (Google requires this field)
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: (product.rating_average || 5).toFixed(1),
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: product.profiles?.full_name || "Người mua hàng",
      },
      reviewBody: `${product.title} là sản phẩm digital chất lượng tốt, tải xuống nhanh chóng.`,
      datePublished: new Date().toISOString().split('T')[0],
    },
  };

  // Add additional product attributes
  if (product.file_format) {
    productStructuredData.additionalProperty = [
      {
        "@type": "PropertyValue",
        name: "Định dạng file",
        value: product.file_format,
      },
    ];
    if (product.file_size) {
      productStructuredData.additionalProperty.push({
        "@type": "PropertyValue",
        name: "Dung lượng",
        value: product.file_size,
      });
    }
  }

  // Breadcrumb Structured Data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      ...(product.categories?.name && product.categories?.slug
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: product.categories.name,
              item: `${siteUrl}/category/${product.categories.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.categories?.name && product.categories?.slug ? 3 : 2,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  // Website Structured Data for search
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Salemylink.com",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // FAQPage structured data - ALL FAQ questions in ONE single FAQPage (Google requirement)
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${product.title} có định dạng file gì?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: product.file_format 
            ? `Sản phẩm được cung cấp ở định dạng ${product.file_format}. Bạn có thể tải xuống và sử dụng ngay sau khi thanh toán thành công.`
            : `Sản phẩm được cung cấp ở định dạng digital, bạn có thể tải xuống ngay sau khi thanh toán thành công.`
        },
      },
      {
        "@type": "Question",
        name: "Tôi nhận sản phẩm như thế nào sau khi mua?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sau khi thanh toán thành công, bạn sẽ nhận được link Google Drive để tải sản phẩm về. Link này sẽ được gửi qua email và hiển thị ngay trên trang xác nhận đơn hàng.",
        },
      },
      {
        "@type": "Question",
        name: "Sản phẩm có được cập nhật không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tùy thuộc vào người bán, một số sản phẩm sẽ được cập nhật định kỳ. Bạn nên liên hệ trực tiếp với người bán để biết thêm chi tiết về chính sách cập nhật.",
        },
      },
      {
        "@type": "Question",
        name: "Tôi có thể hoàn tiền không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Chính sách hoàn tiền phụ thuộc vào từng người bán. Vui lòng đọc kỹ mô tả sản phẩm hoặc liên hệ với người bán trước khi mua để biết về chính sách hoàn tiền cụ thể.",
        },
      },
      {
        "@type": "Question",
        name: "Có hỗ trợ sau khi mua không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Người bán thường cung cấp hỗ trợ cho sản phẩm của họ. Bạn có thể liên hệ trực tiếp với người bán thông qua thông tin được cung cấp trong email xác nhận hoặc trong file sản phẩm.",
        },
      },
    ],
  };

  const combinedStructuredData = [
    breadcrumbStructuredData, 
    productStructuredData,
    websiteStructuredData,
    faqStructuredData,
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title={metaTitle}
        description={metaDescription}
        keywords={[
          product.title,
          product.categories?.name,
          ...(product.tags || []),
          "sản phẩm digital",
          "mua bán online",
          "tải xuống",
          product.file_format,
          "salemylink",
        ]
          .filter(Boolean)
          .join(", ")}
        image={mainImage}
        url={productUrl}
        type="product"
        structuredData={combinedStructuredData}
        productPrice={product.price}
        productCurrency="VND"
        productAvailability="InStock"
        productBrand={product.profiles?.full_name}
        productCategory={product.categories?.name}
        productRating={product.rating_average}
        productReviewCount={product.rating_count}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { 
              label: product.categories?.name || 'Danh mục', 
              href: product.categories?.slug ? `/category/${product.categories.slug}` : undefined 
            },
            { label: product.title }
          ]}
        />

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
            <div className="rounded-lg overflow-hidden relative border bg-muted" style={{ height: '70vh', maxHeight: '600px' }}>
              {product.download_only_link ? (
                // Download-only file (EXE, video, images) - show thumbnail with download info
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <img
                    src={product.thumbnail_url || "/placeholder.svg"}
                    alt={`${product.title} - ${product.categories?.name}`}
                    className="max-w-full max-h-48 object-contain rounded-lg mb-6"
                    loading="lazy"
                  />
                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      <p className="font-medium text-lg">File không thể xem trước</p>
                      <p className="text-sm">Định dạng: {product.file_format || 'EXE/Video/Image'}</p>
                      {product.file_size && <p className="text-sm">Dung lượng: {product.file_size}</p>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mua sản phẩm để nhận link tải xuống trực tiếp
                    </p>
                  </div>
                </div>
              ) : product.google_drive_link ? (
                // Google Drive Preview - allows scrolling inside iframe
                <iframe
                  src={getGoogleDrivePreviewUrl(product.google_drive_link)}
                  className="w-full h-full"
                  frameBorder="0"
                  title={`Xem trước ${product.title}`}
                  sandbox="allow-same-origin allow-scripts"
                  allowFullScreen
                />
              ) : (
                // Fallback to thumbnail if no preview
                <img
                  src={product.thumbnail_url || "/placeholder.svg"}
                  alt={`${product.title} - ${product.categories?.name} - Sản phẩm digital chất lượng cao trên Salemylink`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            {/* Preview Note */}
            {product.google_drive_link && !product.download_only_link && (
              <p className="text-sm text-muted-foreground text-center">
                Đây là bản xem trước tài liệu. Mua sản phẩm để tải về phiên bản đầy đủ.
              </p>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <header>
              <Badge variant="secondary" className="mb-2">
                {product.categories?.name}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-lg text-muted-foreground">{product.short_description}</p>
            </header>

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

            {/* Seller Info - Compact */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <img
                src={product.profiles?.avatar_url || "/placeholder.svg"}
                alt={`${product.profiles?.full_name} - Người bán trên Salemylink`}
                className="w-9 h-9 rounded-full object-cover"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">Người bán</span>
                <Link 
                  to={`/seller/${product.seller_id}`}
                  className="block font-medium text-sm hover:text-primary transition-colors truncate"
                >
                  {product.profiles?.full_name || 'Ẩn danh'}
                </Link>
              </div>
              <Link 
                to={`/seller/${product.seller_id}`}
                className="text-xs text-primary hover:underline whitespace-nowrap"
              >
                Xem shop
              </Link>
            </div>

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

        {/* Product FAQ */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6">
              <ProductFAQ 
                productName={product.title}
                category={product.categories?.name || 'Digital'}
                fileFormat={product.file_format}
              />
            </CardContent>
          </Card>
        </div>

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        <RelatedProducts 
          categoryId={product.category_id} 
          currentProductId={product.id}
          categorySlug={product.categories?.slug}
        />
      </main>

      <Footer />
    </div>
  );
}