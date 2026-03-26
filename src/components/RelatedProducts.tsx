import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Eye, ShoppingCart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { FreeDownloadButton } from "@/components/FreeDownloadButton";
import { ReadOnlyButton } from "@/components/ReadOnlyButton";
import { getGoogleDriveThumbnail } from "@/lib/utils";
import { getProductDownloadUrl, isFreeProduct, getGoogleDrivePreviewUrl } from "@/lib/productAccess";

interface RelatedProduct {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  price: number;
  original_price: number;
  google_drive_link: string;
  download_only_link?: string | null;
  download_count: number;
  view_count: number;
  rating_average: number;
  rating_count: number;
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

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
  categorySlug?: string;
}

export const RelatedProducts = ({ categoryId, currentProductId, categorySlug }: RelatedProductsProps) => {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  const fetchRelatedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey(full_name),
          categories(name, slug)
        `)
        .eq('status', 'active')
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
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
          className={`h-3 w-3 ${
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16" aria-labelledby="related-products-heading">
      <div className="mb-8 flex items-center justify-between">
        <h2 id="related-products-heading" className="text-2xl lg:text-3xl font-bold">
          Cùng Danh mục 
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {" "}sản phẩm
          </span>
        </h2>
        {categorySlug && (
          <Link 
            to={`/category/${categorySlug}`}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const isFree = isFreeProduct(product.price);
          const downloadUrl = getProductDownloadUrl(product.google_drive_link, product.download_only_link);

          return <article key={product.id} className="group">
            <Link to={`/product/${product.slug}`} className="block" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                <div className="relative overflow-hidden rounded-t-lg aspect-[4/3] bg-muted">
                  <img
                    src={getGoogleDriveThumbnail(product.google_drive_link, 600)}
                    alt={`Hình ảnh sản phẩm ${product.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.original_price > product.price && (
                    <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground shadow-md">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                      {product.categories?.name}
                    </Badge>
                    {product.file_format && (
                      <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                        {product.file_format.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
                    {product.short_description}
                  </p>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-2">
                      {renderStars(product.rating_average || 0)}
                    </div>
                    <span className="text-xs text-muted-foreground">
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
                      <div className="text-lg font-bold text-primary">
                        {isFree ? 'Miễn phí' : formatPrice(product.price)}
                      </div>
                      {product.original_price > product.price && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <CardFooter className="p-4 pt-2">
              {isFree ? (
                <div className="grid grid-cols-2 gap-2 w-full">
                  <FreeDownloadButton size="sm" downloadUrl={downloadUrl} />
                  <ReadOnlyButton size="sm" previewUrl={getGoogleDrivePreviewUrl(product.google_drive_link)} />
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => addToCart(product.id)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              )}
            </CardFooter>
          </article>;
        })}
      </div>
    </section>
  );
};
