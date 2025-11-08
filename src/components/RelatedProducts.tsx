import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Eye, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { getGoogleDriveThumbnail } from "@/lib/utils";

interface RelatedProduct {
  id: string;
  title: string;
  short_description: string;
  price: number;
  original_price: number;
  google_drive_link: string;
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
  };
}

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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
          categories(name)
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
    <section className="mt-16">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold">
          Cùng Danh mục 
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {" "}sản phẩm
          </span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
            onClick={() => navigate(`/product/${product.id}`)}
          >
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
                <Badge variant="secondary" className="text-xs">
                  {product.categories?.name}
                </Badge>
                {product.file_format && (
                  <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                    {product.file_format.toUpperCase()}
                  </Badge>
                )}
              </div>
              
              <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-[3rem]">
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
                    {formatPrice(product.price)}
                  </div>
                  {product.original_price > product.price && (
                    <div className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
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
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
