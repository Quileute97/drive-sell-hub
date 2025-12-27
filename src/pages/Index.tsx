import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Categories } from "@/components/Categories";
import { ProductList } from "@/components/ProductList";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://salemylink.com/#webpage",
        "url": "https://salemylink.com/",
        "name": "Salemylink.com - Nền tảng bán sản phẩm Digital hàng đầu Việt Nam",
        "description": "Kết nối người mua và người bán sản phẩm digital. Bán tài liệu, ebook, khóa học qua Google Drive một cách an toàn và hiệu quả.",
        "isPartOf": {
          "@id": "https://salemylink.com/#website"
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
            "item": "https://salemylink.com/"
          }]
        }
      },
      {
        "@type": "Organization",
        "@id": "https://salemylink.com/#organization",
        "name": "Salemylink.com",
        "url": "https://salemylink.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://salemylink.com/logo.png",
          "width": 512,
          "height": 512
        },
        "image": "https://salemylink.com/og-image.png",
        "description": "Nền tảng bán sản phẩm Digital hàng đầu Việt Nam",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "support@salemylink.com",
          "availableLanguage": ["Vietnamese", "English"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://salemylink.com/#website",
        "url": "https://salemylink.com/",
        "name": "Salemylink.com",
        "description": "Nền tảng bán sản phẩm Digital hàng đầu Việt Nam",
        "publisher": {
          "@id": "https://salemylink.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://salemylink.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
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
