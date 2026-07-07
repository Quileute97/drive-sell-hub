import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Download, Eye, ShoppingCart, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedCategories } from "@/components/RelatedCategories";
import { getTagSeo } from "@/data/seoOverrides";

interface Product {
  id: string;
  slug: string;
  title: string;
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
  tags: string[];
  profiles: { full_name: string };
  categories: { id: string; name: string; slug: string };
}

export default function TagProducts() {
  const { tag } = useParams<{ tag: string }>();
  const decodedTag = decodeURIComponent(tag || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedTags, setRelatedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (decodedTag) fetchProducts();
  }, [decodedTag, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("products")
        .select(`*, profiles!products_seller_id_fkey(full_name), categories(id, name, slug)`)
        .eq("status", "active")
        .contains("tags", [decodedTag]);

      switch (sortBy) {
        case "newest": query = query.order("created_at", { ascending: false }); break;
        case "popular": query = query.order("download_count", { ascending: false }); break;
        case "price_asc": query = query.order("price", { ascending: true }); break;
        case "price_desc": query = query.order("price", { ascending: false }); break;
        case "rating": query = query.order("rating_average", { ascending: false }); break;
      }

      const { data, error } = await query;
      if (error) throw error;

      setProducts(data || []);

      // Extract related tags from fetched products
      const tagSet = new Set<string>();
      (data || []).forEach((p: Product) => {
        (p.tags || []).forEach((t: string) => {
          if (t.toLowerCase() !== decodedTag.toLowerCase()) tagSet.add(t);
        });
      });
      setRelatedTags(Array.from(tagSet).slice(0, 15));
    } catch (error) {
      console.error("Error fetching products by tag:", error);
      toast({ title: "Lỗi", description: "Không thể tải sản phẩm", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
    ));

  const siteUrl = "https://salemylink.com";
  const canonicalUrl = `${siteUrl}/tag/${encodeURIComponent(decodedTag)}`;

  const metaTitle = `${decodedTag} - Sản phẩm Digital | Salemylink.com`;
  const metaDescription = `Tìm thấy ${products.length} sản phẩm digital với tag "${decodedTag}" tại Salemylink.com. Khám phá ebook, tài liệu, khóa học chất lượng cao.`;
  const metaKeywords = [decodedTag, "sản phẩm digital", "ebook", "tài liệu", "salemylink"].join(", ");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonicalUrl,
        name: metaTitle,
        url: canonicalUrl,
        description: metaDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          { "@type": "ListItem", position: 2, name: `Tag: ${decodedTag}`, item: canonicalUrl },
        ],
      },
      ...(products.length > 0
        ? [{
            "@type": "ItemList",
            itemListElement: products.slice(0, 10).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${siteUrl}/product/${p.slug}`,
              name: p.title,
            })),
          }]
        : []),
    ],
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: `Tag: ${decodedTag}` },
  ];

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDescription}
        keywords={metaKeywords}
        url={canonicalUrl}
        type="website"
        structuredData={structuredData}
      />
      <Header />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <Breadcrumb items={breadcrumbItems} />

        {/* Tag Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">{decodedTag}</h1>
          </div>
          <p className="text-muted-foreground">
            {loading ? "Đang tải..." : `${products.length} sản phẩm được gắn tag "${decodedTag}"`}
          </p>
        </div>

        {/* Related Tags */}
        {relatedTags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Tags liên quan</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((t) => (
                <Link key={t} to={`/tag/${encodeURIComponent(t)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent transition-colors">
                    {t}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sort */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-muted-foreground">{products.length} sản phẩm</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="popular">Phổ biến nhất</SelectItem>
              <SelectItem value="price_asc">Giá tăng dần</SelectItem>
              <SelectItem value="price_desc">Giá giảm dần</SelectItem>
              <SelectItem value="rating">Đánh giá cao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-muted-foreground mb-4">Chưa có sản phẩm nào với tag "{decodedTag}"</p>
            <Link to="/search">
              <Button>Khám phá sản phẩm khác</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <Link to={`/product/${product.slug}`}>
                  <div className="relative overflow-hidden">
                    <ProductThumbnail
                      thumbnailUrl={product.thumbnail_url}
                      googleDriveLink={product.google_drive_link}
                      title={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.original_price && product.original_price > product.price && (
                      <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                        -{Math.round((1 - product.price / product.original_price) * 100)}%
                      </Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors mb-1">
                      {product.title}
                    </h3>
                  </Link>
                  {product.categories && (
                    <Link to={`/category/${product.categories.slug}`} className="text-xs text-muted-foreground hover:text-primary">
                      {product.categories.name}
                    </Link>
                  )}
                  {product.rating_count > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {renderStars(product.rating_average)}
                      <span className="text-xs text-muted-foreground ml-1">({product.rating_count})</span>
                    </div>
                  )}
                  {(product.download_count > 0 || product.view_count > 0) && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {product.download_count > 0 && <span className="flex items-center gap-1"><Download className="h-3 w-3" />{product.download_count}</span>}
                      {product.view_count > 0 && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{product.view_count}</span>}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xs text-muted-foreground line-through ml-2">{formatPrice(product.original_price)}</span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" aria-label="Thêm vào giỏ hàng" onClick={() => addToCart(product.id)}>
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <RelatedCategories />
      </main>
      <Footer />
    </>
  );
}
