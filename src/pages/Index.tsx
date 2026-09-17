import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductList } from "@/components/ProductList";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Features } from "@/components/Features";
import { Categories } from "@/components/Categories";
import { PopularTags } from "@/components/PopularTags";
import { TrustSignals } from "@/components/TrustSignals";

interface IndexProps {
  initialProducts?: any[];
  initialCategories?: any[];
}

const Index = ({ initialProducts, initialCategories }: IndexProps) => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Salemylink - Marketplace Ebook, Tài Liệu Học Tập & Khóa Học Online | Việt Nam"
        description="Salemylink – Marketplace mua bán tài liệu số, ebook, khóa học online qua Google Drive uy tín hàng đầu Việt Nam. Tải xuống tức thì, thanh toán tự động an toàn."
        keywords="bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, thương mại điện tử, marketplace digital, mua bán ebook, tài liệu số, khóa học trực tuyến"
        url="https://salemylink.com/"
      />
      <Header />
      <main>
        {/* Above-the-fold: eagerly loaded for LCP */}
        <Hero />
        <ProductList initialProducts={initialProducts} />
        <Categories initialCategories={initialCategories} />
        <PopularTags />
        <Features />
        <TrustSignals />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
