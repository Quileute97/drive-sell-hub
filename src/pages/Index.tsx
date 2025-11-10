import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Categories } from "@/components/Categories";
import { ProductList } from "@/components/ProductList";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Salemylink.com - Nền tảng bán sản phẩm Digital hàng đầu Việt Nam"
        description="Kết nối người mua và người bán sản phẩm digital. Bán tài liệu, ebook, khóa học qua Google Drive một cách an toàn và hiệu quả. Hoa hồng chỉ 5%, thanh toán nhanh chóng."
        keywords="bán sản phẩm digital, ebook việt nam, tài liệu digital, khóa học online, google drive, thương mại điện tử, marketplace digital"
        url="https://salemylink.com/"
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
