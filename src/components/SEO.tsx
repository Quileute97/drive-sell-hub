import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export const SEO = ({
  title = "Salemylink.com - Nền tảng bán sản phẩm Digital hàng đầu Việt Nam",
  description = "Kết nối người mua và người bán sản phẩm digital. Bán tài liệu, ebook, khóa học qua Google Drive một cách an toàn và hiệu quả. Hoa hồng chỉ 5%, thanh toán nhanh chóng.",
  keywords = "bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, thương mại điện tử, marketplace digital, bán tài liệu online",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url = "https://salemylink.com/",
  type = "website",
  structuredData
}: SEOProps) => {
  const fullTitle = title.includes('Salemylink') ? title : `${title} | Salemylink.com`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content="Salemylink.com" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
