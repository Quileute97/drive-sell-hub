import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Eye, Download, Calendar, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FollowButton } from "@/components/FollowButton";

interface SellerInfo {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  is_verified: boolean;
}

interface ProductItem {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  price: number;
  original_price: number | null;
  thumbnail_url: string | null;
  google_drive_link: string;
  rating_average: number;
  rating_count: number;
  download_count: number;
  view_count: number;
  categories: {
    name: string;
    slug: string;
  };
}

export default function SellerProfile() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalDownloads: 0,
    totalViews: 0,
    avgRating: 0
  });

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      // Fetch seller info
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, created_at, is_verified')
        .eq('user_id', sellerId)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Fetch seller's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id, slug, title, short_description, price, original_price,
          thumbnail_url, google_drive_link, rating_average, rating_count,
          download_count, view_count,
          categories(name, slug)
        `)
        .eq('seller_id', sellerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Calculate stats
      if (productsData && productsData.length > 0) {
        const totalDownloads = productsData.reduce((sum, p) => sum + (p.download_count || 0), 0);
        const totalViews = productsData.reduce((sum, p) => sum + (p.view_count || 0), 0);
        const ratings = productsData.filter(p => p.rating_count > 0);
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, p) => sum + (p.rating_average || 0), 0) / ratings.length 
          : 0;

        setStats({
          totalProducts: productsData.length,
          totalDownloads,
          totalViews,
          avgRating
        });
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
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

  const getGoogleDriveThumbnail = (driveUrl: string) => {
    const fileIdMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w600`;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-48" />
                <div className="h-4 bg-muted rounded w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy người bán</h1>
          <p className="text-muted-foreground">Người bán này không tồn tại hoặc đã bị xóa.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const siteUrl = "https://salemylink.com";
  const sellerUrl = `${siteUrl}/seller/${seller.user_id}`;
  
  const sellerStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": sellerUrl,
      "name": `${seller.full_name || 'Người bán'} - Cửa hàng sản phẩm Digital`,
      "description": `Khám phá ${stats.totalProducts} sản phẩm digital từ ${seller.full_name}. ${stats.totalDownloads} lượt tải, đánh giá ${stats.avgRating.toFixed(1)}/5 sao.`,
      "url": sellerUrl,
      "dateCreated": seller.created_at,
      "mainEntity": {
        "@type": "Person",
        "@id": `${sellerUrl}#person`,
        "name": seller.full_name || "Người bán",
        "url": sellerUrl,
        "image": seller.avatar_url || undefined,
        "worksFor": {
          "@type": "Organization",
          "name": "Salemylink.com"
        }
      },
      "isPartOf": {
        "@id": `${siteUrl}/#website`
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Trang chủ",
          "item": siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Người bán",
          "item": `${siteUrl}/sellers`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": seller.full_name || "Cửa hàng",
          "item": sellerUrl
        }
      ]
    },
    ...(products.length > 0 ? [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Sản phẩm của ${seller.full_name || 'Cửa hàng'}`,
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.title,
          "url": `${siteUrl}/product/${product.slug}`,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "VND"
          }
        }
      }))
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${seller.full_name || 'Người bán'} - Cửa hàng sản phẩm Digital | Salemylink`}
        description={`Khám phá ${stats.totalProducts} sản phẩm digital từ ${seller.full_name}. ${stats.totalDownloads} lượt tải, đánh giá ${stats.avgRating.toFixed(1)}/5 sao. Mua ngay tại Salemylink.com`}
        keywords={`${seller.full_name}, cửa hàng, người bán, sản phẩm digital, Salemylink, ebook, tài liệu`}
        url={sellerUrl}
        image={seller.avatar_url || undefined}
        structuredData={sellerStructuredData}
      />
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Người bán' },
            { label: seller.full_name || 'Cửa hàng' }
          ]}
        />

        {/* Seller Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <img
                src={seller.avatar_url || "/placeholder.svg"}
                alt={seller.full_name || 'Người bán'}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
              />

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{seller.full_name || 'Cửa hàng'}</h1>
                  {seller.is_verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Đã xác minh
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  Tham gia từ {formatDate(seller.created_at)}
                </div>
                <FollowButton sellerId={seller.user_id} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Package className="h-4 w-4" /> Sản phẩm
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalDownloads}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Download className="h-4 w-4" /> Lượt tải
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalViews}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Eye className="h-4 w-4" /> Lượt xem
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  {stats.avgRating.toFixed(1)}
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-muted-foreground">Đánh giá</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sản phẩm của cửa hàng ({products.length})
          </h2>

          {products.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Chưa có sản phẩm nào.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const thumbnailUrl = product.thumbnail_url || 
                  (product.google_drive_link ? getGoogleDriveThumbnail(product.google_drive_link) : null) || 
                  "/placeholder.svg";

                return (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                        <img
                          src={thumbnailUrl}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {product.original_price && product.original_price > product.price && (
                          <Badge className="absolute top-2 left-2 bg-red-500">
                            -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {product.categories?.name}
                        </Badge>
                        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{(product.rating_average || 0).toFixed(1)}</span>
                          <span className="mx-1">•</span>
                          <Download className="h-3 w-3" />
                          <span>{product.download_count || 0}</span>
                        </div>
                        <div className="mt-2">
                          <span className="font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-xs text-muted-foreground line-through ml-2">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
