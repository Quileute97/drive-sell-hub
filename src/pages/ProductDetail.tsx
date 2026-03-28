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
import { RelatedCategories } from "@/components/RelatedCategories";
import { FreeDownloadButton } from "@/components/FreeDownloadButton";
import { ReadOnlyButton } from "@/components/ReadOnlyButton";
import { TableOfContents, injectHeadingIds } from "@/components/TableOfContents";
import { getProductDownloadUrl, isFreeProduct, getGoogleDrivePreviewUrl } from "@/lib/productAccess";

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
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  categories: {
    name: string;
    slug: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
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
      
      // Fetch reviews for structured data
      if (data?.id) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            profiles:buyer_id(full_name)
          `)
          .eq('product_id', data.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (reviewsData) {
          setReviews(reviewsData as Review[]);
        }
        
        // Increment view count
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
  
  // SEO-optimized meta title: Include primary keyword + action word + brand
  const metaTitle = product.meta_title || 
    `${product.title} - Tải xuống ngay | ${product.categories?.name || 'Sản phẩm Digital'}`;
  
  // SEO-optimized description with call-to-action
  const metaDescription =
    product.meta_description ||
    product.short_description ||
    (product.description 
      ? product.description.substring(0, 140) + ` Tải ngay tại Salemylink.com`
      : `${product.title} - ${product.categories?.name || 'Sản phẩm digital'}. Tải xuống ngay sau khi thanh toán. An toàn, nhanh chóng trên Salemylink.com`);

  const productImages = [product.thumbnail_url, ...(product.images || [])].filter(Boolean);
  const mainImage = productImages[0] || `${siteUrl}/og-image.png`;

  const datePublished = new Date(product.created_at).toISOString();
  const dateModified = new Date(product.updated_at).toISOString();
  const priceValidUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  const isFree = isFreeProduct(product.price);
  const freeDownloadUrl = getProductDownloadUrl(product.google_drive_link, product.download_only_link);

  // Build structured data using @graph pattern (Google recommended - avoids duplicate @context)
  const graphNodes: Record<string, any>[] = [];

  // 1. Organization node (referenced by other nodes)
  graphNodes.push({
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Salemylink.com",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
      width: 200,
      height: 200,
    },
    image: `${siteUrl}/og-image.png`,
  });

  // WebSite node
  graphNodes.push({
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Salemylink.com",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });

  // 2. BreadcrumbList
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Trang chủ",
      item: siteUrl,
    },
  ];
  if (product.categories?.name && product.categories?.slug) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: product.categories.name,
      item: `${siteUrl}/category/${product.categories.slug}`,
    });
  }
  breadcrumbItems.push({
    "@type": "ListItem",
    position: breadcrumbItems.length + 1,
    name: product.title,
    item: productUrl,
  });

  graphNodes.push({
    "@type": "BreadcrumbList",
    "@id": `${productUrl}#breadcrumb`,
    itemListElement: breadcrumbItems,
  });

  // 3. Product node (core)
  const productNode: Record<string, any> = {
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.title,
    description: product.description || product.short_description || metaDescription,
    image: productImages.length > 0 ? productImages : [mainImage],
    url: productUrl,
    sku: product.slug,
    category: product.categories?.name,
    brand: {
      "@type": "Brand",
      name: product.profiles?.full_name || "Salemylink.com",
    },
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      price: product.price.toString(),
      priceCurrency: "VND",
      priceValidUntil: priceValidUntil,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: product.profiles?.full_name || "Salemylink.com",
        url: `${siteUrl}/seller/${product.seller_id}`,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "VN",
        },
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
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "MIN",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "VN",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        merchantReturnDays: 0,
      },
    },
  };

  // Only include aggregateRating with real data
  if (product.rating_count > 0) {
    productNode.aggregateRating = {
      "@type": "AggregateRating",
      "@id": `${productUrl}#rating`,
      ratingValue: product.rating_average.toFixed(1),
      reviewCount: product.rating_count,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Only include real reviews with enhanced schema
  if (reviews.length > 0) {
    productNode.review = reviews.map((review, index) => ({
      "@type": "Review",
      "@id": `${productUrl}#review-${index}`,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: review.profiles?.full_name || "Khách hàng",
      },
      reviewBody: review.comment || `Đánh giá ${review.rating} sao cho ${product.title}`,
      datePublished: new Date(review.created_at).toISOString().split('T')[0],
      publisher: { "@id": `${siteUrl}/#organization` },
    }));
  }

  // Additional product properties
  const additionalProperties = [];
  if (product.file_format) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Định dạng file",
      value: product.file_format,
    });
  }
  if (product.file_size) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Dung lượng",
      value: product.file_size,
    });
  }
  if (additionalProperties.length > 0) {
    productNode.additionalProperty = additionalProperties;
  }

  graphNodes.push(productNode);

  // 4. FAQPage node — dynamic FAQs based on product data
  const faqItems: { name: string; text: string }[] = [
    {
      name: `${product.title} có định dạng file gì?`,
      text: product.file_format 
        ? `Sản phẩm được cung cấp ở định dạng ${product.file_format}${product.file_size ? `, dung lượng ${product.file_size}` : ''}. Bạn có thể tải xuống và sử dụng ngay sau khi thanh toán thành công.`
        : `Sản phẩm được cung cấp ở định dạng digital, bạn có thể tải xuống ngay sau khi thanh toán thành công.`
    },
    {
      name: `Giá ${product.title} là bao nhiêu?`,
      text: `${product.title} hiện có giá ${new Intl.NumberFormat('vi-VN').format(product.price)} VND${product.original_price && product.original_price > product.price ? ` (giảm ${Math.round(((product.original_price - product.price) / product.original_price) * 100)}% từ ${new Intl.NumberFormat('vi-VN').format(product.original_price)} VND)` : ''}. Thanh toán nhanh chóng qua nhiều phương thức trên Salemylink.com.`
    },
    {
      name: `Mua ${product.title} ở đâu uy tín?`,
      text: `Bạn có thể mua ${product.title} tại Salemylink.com - nền tảng bán sản phẩm digital uy tín hàng đầu Việt Nam. Sản phẩm được bán bởi ${product.profiles?.full_name || 'người bán uy tín'}${product.download_count > 0 ? `, đã có ${product.download_count} lượt tải` : ''}${product.rating_count > 0 ? ` và ${product.rating_count} đánh giá` : ''}.`
    },
    {
      name: "Tôi nhận sản phẩm như thế nào sau khi mua?",
      text: "Sau khi thanh toán thành công, bạn sẽ nhận được link tải sản phẩm ngay lập tức. Link sẽ hiển thị trên trang xác nhận đơn hàng và được gửi qua email. Sản phẩm digital được giao ngay, không mất thời gian chờ đợi."
    },
    {
      name: "Có hỗ trợ sau khi mua không?",
      text: `Có, người bán ${product.profiles?.full_name || ''} cung cấp hỗ trợ cho sản phẩm. Bạn có thể liên hệ trực tiếp qua trang hồ sơ người bán trên Salemylink.com hoặc thông tin trong email xác nhận.`
    },
  ];

  // Add rating-based FAQ if product has reviews
  if (product.rating_count > 0) {
    faqItems.push({
      name: `${product.title} có tốt không? Đánh giá thế nào?`,
      text: `${product.title} được đánh giá ${product.rating_average.toFixed(1)}/5 sao bởi ${product.rating_count} khách hàng. ${product.rating_average >= 4 ? 'Đây là sản phẩm được đánh giá cao trên Salemylink.com.' : 'Hãy xem các đánh giá chi tiết bên dưới để biết thêm.'}`
    });
  }

  graphNodes.push({
    "@type": "FAQPage",
    "@id": `${productUrl}#faq`,
    mainEntity: faqItems.map(faq => ({
      "@type": "Question",
      name: faq.name,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.text,
      },
    })),
  });

  // 5. WebPage node — use ItemPage for product pages (more specific)
  graphNodes.push({
    "@type": "ItemPage",
    "@id": `${productUrl}#webpage`,
    url: productUrl,
    name: metaTitle,
    description: metaDescription,
    datePublished: datePublished,
    dateModified: dateModified,
    isPartOf: { "@id": `${siteUrl}/#website` },
    breadcrumb: { "@id": `${productUrl}#breadcrumb` },
    mainEntity: { "@id": `${productUrl}#product` },
    inLanguage: "vi",
    potentialAction: {
      "@type": "BuyAction",
      target: productUrl,
      "price": product.price.toString(),
      "priceCurrency": "VND",
    },
  });

  // Combined structured data using @graph
  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": graphNodes,
  };

  // SEO keywords: product-specific + long-tail
  const seoKeywords = [
    product.title,
    `${product.title} tải xuống`,
    `mua ${product.title}`,
    product.categories?.name,
    ...(product.tags || []),
    product.file_format ? `tài liệu ${product.file_format}` : null,
    "sản phẩm digital",
    "tải xuống nhanh",
    "salemylink",
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen">
      <SEO 
        title={metaTitle}
        description={metaDescription}
        keywords={seoKeywords}
        image={mainImage}
        url={productUrl}
        type="product"
        structuredData={combinedStructuredData}
        publishedTime={datePublished}
        modifiedTime={dateModified}
        author={product.profiles?.full_name}
        productPrice={product.price}
        productCurrency="VND"
        productAvailability="InStock"
        productBrand={product.profiles?.full_name}
        productCategory={product.categories?.name}
        productRating={product.rating_count > 0 ? product.rating_average : undefined}
        productReviewCount={product.rating_count > 0 ? product.rating_count : undefined}
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
                        {isFree ? 'Tải miễn phí ngay để nhận tài liệu' : 'Mua sản phẩm để nhận link tải xuống trực tiếp'}
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
                {isFree ? 'Miễn phí' : formatPrice(product.price)}
              </div>
              {product.original_price > product.price && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <Badge className="bg-destructive text-destructive-foreground">
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
                    <Link key={index} to={`/tag/${encodeURIComponent(tag)}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isFree ? (
                (product as any).read_only ? (
                  <ReadOnlyButton
                    size="lg"
                    className="w-full"
                    previewUrl={getGoogleDrivePreviewUrl(product.google_drive_link)}
                    onMissingUrl={() => {
                      toast({
                        title: "Không có link xem",
                        description: "Tài liệu này hiện chưa hỗ trợ đọc trực tuyến",
                        variant: "destructive",
                      });
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <FreeDownloadButton
                      size="lg"
                      downloadUrl={freeDownloadUrl}
                      onMissingUrl={() => {
                        toast({
                          title: "Thiếu link tải",
                          description: "Tài liệu miễn phí này hiện chưa có link tải hợp lệ",
                          variant: "destructive",
                        });
                      }}
                    />
                    <ReadOnlyButton
                      size="lg"
                      previewUrl={getGoogleDrivePreviewUrl(product.google_drive_link)}
                      onMissingUrl={() => {
                        toast({
                          title: "Không có link xem",
                          description: "Tài liệu này hiện chưa hỗ trợ đọc trực tuyến",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                )
              ) : (
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
              )}
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
              <h2 className="text-2xl font-bold mb-4">Mô tả chi tiết {product.title}</h2>
              <TableOfContents htmlContent={product.description || ''} />
              <div 
                className="prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg prose-img:mx-auto prose-headings:scroll-mt-20" 
                itemProp="description"
                dangerouslySetInnerHTML={{ __html: injectHeadingIds(product.description || '') }}
              />
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

        {/* Related Categories — internal linking for SEO */}
        <RelatedCategories 
          currentCategoryId={product.category_id}
          title="Khám phá danh mục khác"
        />
      </main>

      <Footer />
    </div>
  );
}