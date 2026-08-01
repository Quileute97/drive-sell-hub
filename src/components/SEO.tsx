import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  structuredData?: object | object[];
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  // Product-specific props
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  productBrand?: string;
  productCategory?: string;
  productRating?: number;
  productReviewCount?: number;
}

export const SEO = ({
  title = "Salemylink - Marketplace sản phẩm Digital Việt Nam",
  description = "Marketplace sản phẩm digital Việt Nam. Mua bán ebook, tài liệu, khóa học qua Google Drive an toàn, nhanh chóng.",
  keywords = "bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, thương mại điện tử, marketplace digital, bán tài liệu online",
  image = "https://salemylink.com/og-image.png",
  url = "https://salemylink.com/",
  type = "website",
  structuredData,
  noindex = false,
  publishedTime,
  modifiedTime,
  author,
  productPrice,
  productCurrency = "VND",
  productAvailability = "InStock",
  productBrand,
  productCategory,
  productRating,
  productReviewCount
}: SEOProps) => {
  const fullTitle = title.includes('Salemylink') ? title : `${title} | Salemylink`;
  
  // Ensure description is within optimal length (150-160 chars)
  const optimizedDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;

  // Format price for Open Graph
  const formattedPrice = productPrice ? productPrice.toString() : undefined;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={optimizedDescription} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'product' ? 'product' : type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content="Salemylink.com" />
      
      {/* Product-specific Open Graph tags */}
      {type === 'product' && formattedPrice && (
        <>
          <meta property="product:price:amount" content={formattedPrice} />
          <meta property="product:price:currency" content={productCurrency} />
          <meta property="product:availability" content={productAvailability.toLowerCase()} />
          {productBrand && <meta property="product:brand" content={productBrand} />}
          {productCategory && <meta property="product:category" content={productCategory} />}
        </>
      )}
      
      {/* Article specific tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@salemylink" />
      <meta name="twitter:creator" content="@salemylink" />
      
      {/* Twitter Product Card */}
      {type === 'product' && formattedPrice && (
        <>
          <meta name="twitter:label1" content="Giá" />
          <meta name="twitter:data1" content={`${new Intl.NumberFormat('vi-VN').format(productPrice!)} ${productCurrency}`} />
          {productCategory && (
            <>
              <meta name="twitter:label2" content="Danh mục" />
              <meta name="twitter:data2" content={productCategory} />
            </>
          )}
        </>
      )}

      {/* Additional SEO */}
      <meta name="author" content={author || "Salemylink.com"} />
      <meta name="publisher" content="Salemylink.com" />
      <meta name="language" content="vi" />
      <meta name="geo.region" content="VN" />
      <meta name="geo.placename" content="Vietnam" />
      <meta name="content-language" content="vi" />
      
      {/* Mobile optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="theme-color" content="#6366f1" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
