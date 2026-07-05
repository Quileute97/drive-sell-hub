import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, Eye, Download, ChevronRight } from "lucide-react";
import { getGoogleDriveThumbnail } from "@/lib/utils";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { SEO } from "@/components/SEO";
import { RelatedCategories } from "@/components/RelatedCategories";

interface Product {
  id: string;
  slug: string;
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
  created_at: string;
  updated_at: string;
  file_format: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image_url: string | null;
  updated_at: string;
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
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

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
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="h-6 bg-muted rounded w-2/3"></div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded"></div>
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

  const siteUrl = "https://salemylink.com";
  const categoryUrl = `${siteUrl}/category/${category.slug}`;
  const categoryImage = category.image_url || `${siteUrl}/og-image.png`;

  // SEO meta
  const metaTitle = `${category.name} - Salemylink`;
  const metaDescription = category.description 
    || `Tổng hợp ${products.length} sản phẩm ${category.name} chất lượng cao. Mua và tải xuống ngay ${category.name} giá tốt nhất tại Salemylink.com. An toàn, nhanh chóng.`;
  
  // Long-tail keywords for category ranking
  const metaKeywords = [
    category.name,
    `${category.name} giá rẻ`,
    `mua ${category.name}`,
    `tải ${category.name}`,
    `${category.name} online`,
    `${category.name} chất lượng cao`,
    `${category.name} việt nam`,
    `download ${category.name}`,
    "sản phẩm digital",
    "tài liệu digital",
    "salemylink",
  ].join(", ");

  // Find latest updated product for dateModified
  const latestUpdate = products.length > 0 
    ? products.reduce((latest, p) => 
        new Date(p.updated_at) > new Date(latest) ? p.updated_at : latest, 
        products[0].updated_at
      )
    : category.updated_at;

  // === Structured Data using @graph ===
  const graphNodes: Record<string, any>[] = [];

  // 1. Organization
  graphNodes.push({
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Salemylink.com",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
    },
  });

  // 2. WebSite
  graphNodes.push({
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Salemylink.com",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });

  // 3. BreadcrumbList
  graphNodes.push({
    "@type": "BreadcrumbList",
    "@id": `${categoryUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: categoryUrl,
      },
    ],
  });

  // 4. CollectionPage
  graphNodes.push({
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#webpage`,
    url: categoryUrl,
    name: metaTitle,
    description: metaDescription,
    dateModified: new Date(latestUpdate).toISOString(),
    isPartOf: { "@id": `${siteUrl}/#website` },
    breadcrumb: { "@id": `${categoryUrl}#breadcrumb` },
    about: { "@id": `${categoryUrl}#itemlist` },
    inLanguage: "vi",
  });

  // 5. ItemList — core schema for category SEO
  graphNodes.push({
    "@type": "ItemList",
    "@id": `${categoryUrl}#itemlist`,
    name: `${category.name} - Danh sách sản phẩm digital`,
    description: `Tổng hợp ${products.length} sản phẩm digital ${category.name} chất lượng cao tại Salemylink.com`,
    numberOfItems: products.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: products.slice(0, 30).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/product/${product.slug}`,
      item: {
        "@type": "Product",
        "@id": `${siteUrl}/product/${product.slug}#product`,
        name: product.title,
        url: `${siteUrl}/product/${product.slug}`,
        ...(product.short_description ? { description: product.short_description } : {}),
        image: product.thumbnail_url || getGoogleDriveThumbnail(product.google_drive_link) || `${siteUrl}/placeholder.svg`,
        offers: {
          "@type": "Offer",
          price: product.price.toString(),
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/product/${product.slug}`,
        },
        ...(product.rating_count > 0 ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating_average.toFixed(1),
            reviewCount: product.rating_count,
            bestRating: "5",
            worstRating: "1",
          },
        } : {}),
      },
    })),
  });

  // 6. FAQPage for category — helps rank for question-based queries
  graphNodes.push({
    "@type": "FAQPage",
    "@id": `${categoryUrl}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: `${category.name} là gì?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: category.description || `${category.name} là danh mục sản phẩm digital trên Salemylink.com, bao gồm các tài liệu, ebook, khóa học và file digital chất lượng cao. Hiện có ${products.length} sản phẩm đang bán.`,
        },
      },
      {
        "@type": "Question",
        name: `Mua ${category.name} ở đâu uy tín?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Bạn có thể mua ${category.name} chất lượng cao tại Salemylink.com - nền tảng bán sản phẩm digital uy tín hàng đầu Việt Nam. Thanh toán an toàn, nhận file ngay sau khi mua. Hiện có ${products.length} sản phẩm ${category.name} với giá tốt nhất.`,
        },
      },
      {
        "@type": "Question",
        name: `${category.name} có những sản phẩm nào?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: products.length > 0 
            ? `Danh mục ${category.name} hiện có ${products.length} sản phẩm, bao gồm: ${products.slice(0, 5).map(p => p.title).join(', ')}${products.length > 5 ? ` và ${products.length - 5} sản phẩm khác` : ''}.`
            : `Danh mục ${category.name} đang được cập nhật thêm sản phẩm mới. Hãy quay lại thường xuyên để khám phá.`,
        },
      },
    ],
  });

  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": graphNodes,
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title={metaTitle}
        description={metaDescription}
        keywords={metaKeywords}
        url={categoryUrl}
        image={categoryImage}
        structuredData={combinedStructuredData}
        modifiedTime={new Date(latestUpdate).toISOString()}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center text-sm text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/" className="hover:text-primary transition-colors" itemProp="item">
                <span itemProp="name">Trang chủ</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <ChevronRight className="h-3 w-3 mx-2" />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" className="text-foreground font-medium">{category.name}</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        {/* Category Header — semantic header with H1 */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {category.description}
            </p>
          )}
          <p className="text-muted-foreground mt-3">
            Hiện có <strong>{products.length}</strong> sản phẩm digital chất lượng cao
          </p>
        </header>

        {/* Products Grid */}
        {products.length > 0 ? (
          <section aria-label={`Danh sách sản phẩm ${category.name}`}>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <article 
                  key={product.id}
                  className="group"
                >
                  <Card
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full"
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
                          fetchPriority={index < 4 ? "high" : "auto"}
                        />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h2 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors text-base">
                        {product.title}
                      </h2>
                      {product.short_description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.short_description}
                        </p>
                      )}

                      {/* Rating */}
                      {product.rating_count > 0 && (
                        <div className="flex items-center mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">
                            {product.rating_average?.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({product.rating_count} đánh giá)
                          </span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-4 mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {product.download_count} lượt tải
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {product.view_count} lượt xem
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
                </article>
              ))}
            </div>

            {/* SEO-friendly text block for crawlers */}
            <div className="mt-12 prose prose-sm max-w-none text-muted-foreground">
              <h2 className="text-xl font-semibold text-foreground">
                Mua {category.name} chất lượng cao tại Salemylink.com
              </h2>
              <p>
                Salemylink.com cung cấp {products.length} sản phẩm {category.name} được tuyển chọn kỹ lưỡng.
                Tất cả sản phẩm đều được kiểm duyệt về chất lượng, đảm bảo an toàn khi tải xuống.
                Thanh toán nhanh chóng qua nhiều phương thức, nhận file ngay sau khi thanh toán thành công.
              </p>
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Chưa có sản phẩm nào trong danh mục này</p>
            <p className="text-muted-foreground mt-2">Danh mục {category.name} đang được cập nhật. Hãy quay lại sau!</p>
          </div>
        )}

        {/* Related Categories — cross-linking for SEO authority */}
        <RelatedCategories 
          currentCategoryId={category.id}
          title={`Danh mục liên quan đến ${category.name}`}
        />
      </main>

      <Footer />
    </div>
  );
}
