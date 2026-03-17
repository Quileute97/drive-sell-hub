import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductList } from "@/components/ProductList";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

// Lazy load below-fold components (improves FID/TBT)
const Features = lazy(() => import("@/components/Features").then(m => ({ default: m.Features })));
const Categories = lazy(() => import("@/components/Categories").then(m => ({ default: m.Categories })));
const PopularTags = lazy(() => import("@/components/PopularTags").then(m => ({ default: m.PopularTags })));

const LazyFallback = () => (
  <div className="py-20">
    <div className="container mx-auto px-4">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
        <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-muted rounded"></div>)}
        </div>
      </div>
    </div>
  </div>
);

const Index = () => {
  const siteUrl = "https://salemylink.com";
  
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        "url": siteUrl,
        "name": "Salemylink.com - Nền tảng bán sản phẩm Digital hàng đầu Việt Nam",
        "description": "Kết nối người mua và người bán sản phẩm digital. Bán tài liệu, ebook, khóa học qua Google Drive một cách an toàn và hiệu quả.",
        "isPartOf": { "@id": `${siteUrl}/#website` },
        "about": {
          "@type": "Thing",
          "name": "Digital Products Marketplace"
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": "Sản phẩm Digital nổi bật",
          "description": "Danh sách sản phẩm digital chất lượng cao tại Salemylink.com",
          "itemListOrder": "https://schema.org/ItemListOrderDescending",
          "numberOfItems": 12
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Trang chủ",
            "item": siteUrl
          }]
        },
        "inLanguage": "vi-VN"
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "Salemylink.com",
        "alternateName": ["Salemylink", "Sale My Link"],
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#logo`,
          "url": `${siteUrl}/logo.png`,
          "contentUrl": `${siteUrl}/logo.png`,
          "width": 512,
          "height": 512,
          "caption": "Salemylink.com Logo"
        },
        "image": [`${siteUrl}/og-image.png`, `${siteUrl}/logo.png`],
        "description": "Nền tảng bán sản phẩm Digital hàng đầu Việt Nam",
        "slogan": "Bán sản phẩm Digital dễ dàng - Hoa hồng chỉ từ 5%",
        "foundingDate": "2024",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "VN"
        },
        "areaServed": { "@type": "Country", "name": "Vietnam" },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@salemylink.com",
            "availableLanguage": ["Vietnamese", "English"]
          }
        ],
        "sameAs": [
          "https://facebook.com/salemylink",
          "https://twitter.com/salemylink"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Salemylink.com",
        "alternateName": "Salemylink",
        "publisher": { "@id": `${siteUrl}/#organization` },
        "inLanguage": "vi-VN",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${siteUrl}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "OnlineStore",
        "@id": `${siteUrl}/#store`,
        "name": "Salemylink.com",
        "url": siteUrl,
        "description": "Marketplace mua bán sản phẩm digital",
        "currenciesAccepted": "VND",
        "paymentAccepted": ["Credit Card", "Bank Transfer", "PayOS"],
        "priceRange": "₫10,000 - ₫10,000,000",
        "areaServed": { "@type": "Country", "name": "Vietnam" }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Salemylink.com là gì?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Salemylink.com là nền tảng mua bán sản phẩm digital hàng đầu Việt Nam, kết nối người mua và người bán ebook, tài liệu, khóa học online thông qua Google Drive một cách an toàn và hiệu quả."
            }
          },
          {
            "@type": "Question",
            "name": "Làm thế nào để bán sản phẩm trên Salemylink?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bạn chỉ cần đăng ký tài khoản người bán, upload sản phẩm lên Google Drive, đặt giá và mô tả. Salemylink sẽ xử lý thanh toán và giao hàng tự động cho bạn."
            }
          },
          {
            "@type": "Question",
            "name": "Hoa hồng của Salemylink là bao nhiêu?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Salemylink chỉ thu hoa hồng từ 5% trên mỗi giao dịch thành công - một trong những mức thấp nhất trên thị trường."
            }
          },
          {
            "@type": "Question",
            "name": "Thanh toán trên Salemylink có an toàn không?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Có, Salemylink sử dụng cổng thanh toán PayOS uy tín, hỗ trợ nhiều phương thức thanh toán như thẻ ngân hàng, chuyển khoản, ví điện tử. Mọi giao dịch đều được mã hóa và bảo mật."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Salemylink.com - Nền tảng bán sản phẩm Digital hàng đầu Việt Nam"
        description="Kết nối người mua và người bán sản phẩm digital. Bán tài liệu, ebook, khóa học qua Google Drive một cách an toàn và hiệu quả. Hoa hồng chỉ 5%, thanh toán nhanh chóng."
        keywords="bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, thương mại điện tử, marketplace digital, mua bán ebook, tài liệu số, khóa học trực tuyến"
        url="https://salemylink.com/"
        structuredData={homepageStructuredData}
      />
      <Header />
      <main>
        {/* Above-the-fold: eagerly loaded for LCP */}
        <Hero />
        <ProductList />
        
        {/* Below-the-fold: lazy loaded for better FID/TBT */}
        <Suspense fallback={<LazyFallback />}>
          <Features />
        </Suspense>
        <Suspense fallback={<LazyFallback />}>
          <Categories />
        </Suspense>
        <Suspense fallback={<LazyFallback />}>
          <PopularTags />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
