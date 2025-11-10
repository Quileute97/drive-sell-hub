import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, Eye, Download } from "lucide-react";
import { getGoogleDriveThumbnail } from "@/lib/utils";
import { SEO } from "@/components/SEO";

interface Product {
  id: string;
  title: string;
  short_description: string;
  price: number;
  original_price: number;
  rating_average: number;
  rating_count: number;
  download_count: number;
  view_count: number;
  google_drive_link: string;
  thumbnail_url: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Fetch products in this category
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh mục",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy danh mục</h1>
          <Button onClick={() => navigate('/')}>Về trang chủ</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO 
        title={`${category.name} - Danh mục sản phẩm digital`}
        description={category.description || `Khám phá ${products.length} sản phẩm digital chất lượng cao trong danh mục ${category.name}. Mua bán ebook, tài liệu, khóa học online tại Salemylink.com`}
        keywords={`${category.name}, sản phẩm digital, ebook, tài liệu, khóa học, ${category.name} việt nam, mua ${category.name} online`}
        url={`https://salemylink.com/category/${category.slug}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": category.name,
          "description": category.description,
          "url": `https://salemylink.com/category/${category.slug}`,
          "numberOfItems": products.length,
          "about": {
            "@type": "Thing",
            "name": category.name
          }
        }}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Category Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-xl text-muted-foreground max-w-3xl">{category.description}</p>
          )}
          <p className="text-muted-foreground mt-4">
            <strong>{products.length}</strong> sản phẩm digital có sẵn
          </p>
        </header>

        {/* Products Grid */}
        {products.length > 0 ? (
          <section className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={getGoogleDriveThumbnail(product.google_drive_link) || product.thumbnail_url || "/placeholder.svg"}
                    alt={`${product.title} - ${category.name} - Sản phẩm digital giá ${new Intl.NumberFormat('vi-VN').format(product.price)}đ`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    width="400"
                    height="400"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.short_description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">
                      {product.rating_average?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({product.rating_count || 0})
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      {product.download_count}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {product.view_count}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </div>
                      {product.original_price > product.price && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </div>
                      )}
                    </div>
                    {product.original_price > product.price && (
                      <Badge variant="destructive" className="text-xs">
                        -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Chưa có sản phẩm nào trong danh mục này</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
