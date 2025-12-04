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
