import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Download, Eye, ShoppingCart, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { getGoogleDriveThumbnail } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

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
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function SearchProducts() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey(full_name),
          categories(id, name, slug)
        `)
        .eq('status', 'active');

      // Search by keyword
      const searchTerm = searchParams.get('q');
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`);
      }

      // Filter by category
      const categoryId = searchParams.get('category');
      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      // Sort
      const sort = searchParams.get('sort') || 'newest';
      switch (sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('download_count', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating_average', { ascending: false });
          break;
      }

      const { data, error } = await query;

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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    
    navigate(`/search?${params.toString()}`);
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

  const pageTitle = searchQuery 
    ? `Tìm kiếm: ${searchQuery}` 
    : selectedCategory 
    ? `Danh mục: ${categories.find(c => c.id === selectedCategory)?.name}` 
    : "Tìm kiếm sản phẩm";

  return (
    <div className="min-h-screen">
      <SEO 
        title={pageTitle}
        description={`Tìm kiếm sản phẩm digital tại Salemylink.com. ${products.length} kết quả phù hợp với tìm kiếm của bạn.`}
        keywords={`tìm kiếm sản phẩm, ${searchQuery}, digital products, ebook, tài liệu online`}
        url={`https://salemylink.com/search${searchQuery ? `?q=${searchQuery}` : ''}`}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">Tìm kiếm sản phẩm</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="price_asc">Giá: Thấp đến cao</SelectItem>
                <SelectItem value="price_desc">Giá: Cao đến thấp</SelectItem>
                <SelectItem value="popular">Phổ biến nhất</SelectItem>
                <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>

          {/* Category Quick Links for SEO */}
          <nav className="flex flex-wrap gap-2" aria-label="Danh mục sản phẩm">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse flex flex-col h-full">
                <div className="aspect-[4/3] bg-muted rounded-t-lg"></div>
                <CardContent className="p-4 flex-grow">
                  <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                  <div className="h-5 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-4">
              Không tìm thấy sản phẩm nào
            </p>
            <Button onClick={() => navigate('/')}>
              Quay về trang chủ
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Tìm thấy {products.length} sản phẩm
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                  onClick={() => navigate(`/product/${product.slug}`)}
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
                          {formatPrice(product.price)}
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
