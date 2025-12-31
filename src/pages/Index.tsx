import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Categories } from "@/components/Categories";
import { ProductList } from "@/components/ProductList";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  const siteUrl = "https://salemylink.com";
  
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // WebPage
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        "url": siteUrl,
        "name": "Salemylink.com - Nền tảng bán sản phẩm Digital hàng đầu Việt Nam",
        "description": "Kết nối người mua và người bán sản phẩm digital. Bán tài liệu, ebook, khóa học qua Google Drive một cách an toàn và hiệu quả.",
        "isPartOf": {
          "@id": `${siteUrl}/#website`
        },
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
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".hero-description"]
        },
        "inLanguage": "vi-VN"
      },
      // Organization - Enhanced
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
        "image": [
          `${siteUrl}/og-image.png`,
          `${siteUrl}/logo.png`
        ],
        "description": "Nền tảng bán sản phẩm Digital hàng đầu Việt Nam - Kết nối người mua và người bán ebook, tài liệu, khóa học online",
        "slogan": "Bán sản phẩm Digital dễ dàng - Hoa hồng chỉ từ 5%",
        "foundingDate": "2024",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "VN",
          "addressLocality": "Hồ Chí Minh",
          "addressRegion": "Việt Nam"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Vietnam"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@salemylink.com",
            "availableLanguage": ["Vietnamese", "English"],
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "08:00",
              "closes": "22:00"
            }
          },
          {
            "@type": "ContactPoint",
            "contactType": "sales",
            "email": "sales@salemylink.com",
            "availableLanguage": ["Vietnamese", "English"]
          }
        ],
        "sameAs": [
          "https://facebook.com/salemylink",
          "https://twitter.com/salemylink",
          "https://youtube.com/@salemylink"
        ]
      },
      // WebSite - Enhanced
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Salemylink.com",
        "alternateName": "Salemylink",
        "description": "Nền tảng bán sản phẩm Digital hàng đầu Việt Nam",
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "inLanguage": "vi-VN",
        "copyrightYear": new Date().getFullYear(),
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${siteUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          {
            "@type": "ReadAction",
            "target": siteUrl
          }
        ]
      },
      // OnlineStore / E-commerce
      {
        "@type": "OnlineStore",
        "@id": `${siteUrl}/#store`,
        "name": "Salemylink.com",
        "url": siteUrl,
        "description": "Marketplace mua bán sản phẩm digital - Ebook, tài liệu, khóa học online",
        "currenciesAccepted": "VND",
        "paymentAccepted": ["Credit Card", "Debit Card", "Bank Transfer", "PayOS"],
        "priceRange": "₫10,000 - ₫10,000,000",
        "areaServed": {
          "@type": "Country",
          "name": "Vietnam"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Danh mục sản phẩm Digital",
          "itemListElement": [
            {
              "@type": "OfferCatalog",
              "name": "Tài liệu học tập",
              "url": `${siteUrl}/category/tai-lieu-hoc-tap`
            },
            {
              "@type": "OfferCatalog",
              "name": "Ebook & Sách",
              "url": `${siteUrl}/category/ebook-sach`
            },
            {
              "@type": "OfferCatalog",
              "name": "Template & Thiết kế",
              "url": `${siteUrl}/category/template-thiet-ke`
            },
            {
              "@type": "OfferCatalog",
              "name": "Khóa học Online",
              "url": `${siteUrl}/category/khoa-hoc-online`
            },
            {
              "@type": "OfferCatalog",
              "name": "Phần mềm & Ứng dụng",
              "url": `${siteUrl}/category/phan-mem-ung-dung`
            }
          ]
        }
      },
      // FAQPage for homepage
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
        <Hero />
        <ProductList />
        <Features />
        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
