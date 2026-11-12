import { Header } from "@/components/Header";
import { Hero, type PlatformStats } from "@/components/Hero";
import { ProductList } from "@/components/ProductList";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Features } from "@/components/Features";
import { Categories } from "@/components/Categories";
import { PopularTags } from "@/components/PopularTags";
import { TrustSignals, type Testimonial, type TrustStats } from "@/components/TrustSignals";
import type { ProductCardData } from "@/components/ProductCard";
import type { SellerCardData } from "@/components/SellerCard";

interface IndexProps {
  initialProducts?: ProductCardData[] | undefined;
  initialHotProducts?: ProductCardData[] | undefined;
  initialTopSellers?: SellerCardData[] | undefined;
  initialCategories?: any[] | undefined;
  initialStats?: PlatformStats | undefined;
  initialTags?: { tag: string; count: number }[] | undefined;
  initialTrustStats?: TrustStats | undefined;
  initialTestimonials?: Testimonial[] | undefined;
}

const Index = ({
  initialProducts,
  initialHotProducts,
  initialTopSellers,
  initialCategories,
  initialStats,
  initialTags,
  initialTrustStats,
  initialTestimonials,
}: IndexProps) => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Salemylink - Mua Bán Tài Liệu Số, Ebook & Khóa Học"
        description="Marketplace mua bán tài liệu số, ebook, khóa học online qua Google Drive uy tín tại Việt Nam. Tải xuống tức thì, thanh toán PayOS an toàn."
        keywords="bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, marketplace digital, mua bán ebook, tài liệu số, khóa học trực tuyến"
        url="https://salemylink.com/"
      />
      <Header />
      <main>
        <Hero initialStats={initialStats} />
        <ProductList
          initialProducts={initialProducts}
          initialHotProducts={initialHotProducts}
          initialTopSellers={initialTopSellers}
        />
        <Categories initialCategories={initialCategories} />
        <PopularTags initialTags={initialTags} />
        <Features />
        <TrustSignals
          initialStats={initialTrustStats}
          initialTestimonials={initialTestimonials}
        />
      </main>
      <Footer initialCategories={initialCategories} />
    </div>
  );
};

export default Index;
