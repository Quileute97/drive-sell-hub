
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Eye, ShoppingCart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { FreeDownloadButton } from "@/components/FreeDownloadButton";
import { ReadOnlyButton } from "@/components/ReadOnlyButton";
import { getProductDownloadUrl, isFreeProduct, getGoogleDrivePreviewUrl } from "@/lib/productAccess";

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number;
  thumbnail_url: string;
  google_drive_link: string;
  download_only_link?: string | null;
  download_count: number;
  view_count: number;
  rating_average: number;
  rating_count: number;
  seller_id: string;
  category_id: string;
  file_format: string;
  file_size: string;
  profiles: {
    full_name: string;
  };
  categories: {
    name: string;
    slug: string;
  };
}

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey(full_name),
          categories(name, slug)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sản phẩm",
        variant: "destructive",
      });
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const handleMissingFreeDownload = () => {
    toast({
      title: "Thiếu link tải",
      description: "Tài liệu miễn phí này hiện chưa có link tải hợp lệ",
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Đang tải sản phẩm...</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse flex flex-col h-full">
                <div className="aspect-[4/3] bg-muted rounded-t-lg"></div>
                <CardContent className="p-4 flex-grow">
                  <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                  <div className="h-5 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-1/3"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Sản phẩm 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}nổi bật
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá các sản phẩm digital chất lượng cao từ những người bán uy tín
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => {
              const isFree = isFreeProduct(product.price);
              const downloadUrl = getProductDownloadUrl(product.google_drive_link, product.download_only_link);

              return <Card 
                key={product.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                <div className="relative overflow-hidden rounded-t-lg aspect-[4/3] bg-muted">
                  <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
                    <ProductThumbnail
                      googleDriveLink={product.google_drive_link}
                      thumbnailUrl={product.thumbnail_url}
                      fileFormat={product.file_format}
                      title={product.title}
                      size={600}
                      loading={index < 4 ? "eager" : "lazy"}
                      fetchPriority={index < 2 ? "high" : "auto"}
                    />
                  </div>
                  {product.original_price > product.price && (
                    <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground shadow-md z-10">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <Link 
                      to={`/category/${product.categories?.slug}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge variant="secondary" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                        {product.categories?.name}
                      </Badge>
                    </Link>
                    {product.file_format && (
                      <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                        {product.file_format.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {product.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
                    {product.short_description || product.description}
                  </p>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-2">
                      {renderStars(product.rating_average || 0)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.rating_count || 0})
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground mb-3 gap-3 flex-wrap">
                    <div className="flex items-center">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      <span>{product.download_count}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>{product.view_count}</span>
                    </div>
                    {product.file_size && (
                      <div className="flex items-center">
                        <span>📄 {product.file_size}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-xl font-bold text-primary">
                        {isFree ? 'Miễn phí' : formatPrice(product.price)}
                      </div>
                      {product.original_price > product.price && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Bởi: {product.profiles?.full_name || 'Ẩn danh'}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  {isFree ? (
                    <FreeDownloadButton
                      size="sm"
                      downloadUrl={downloadUrl}
                      onMissingUrl={handleMissingFreeDownload}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Thêm vào giỏ
                    </Button>
                  )}
                </CardFooter>
                </Card>;
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <a href="/search" className="inline-block">
            <Button variant="outline" size="lg">
              Xem tất cả sản phẩm
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
