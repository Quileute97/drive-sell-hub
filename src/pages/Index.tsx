
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Categories } from "@/components/Categories";
import { ProductList } from "@/components/ProductList";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
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
