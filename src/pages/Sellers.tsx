import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Star, Package, Users } from "lucide-react";

interface Seller {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  total_sales: number | null;
  is_verified: boolean | null;
  product_count: number;
}

export default function Sellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      // Fetch sellers with their product counts
      const { data: sellersData, error: sellersError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, created_at, total_sales, is_verified')
        .eq('role', 'seller')
        .order('total_sales', { ascending: false });

      if (sellersError) throw sellersError;

      // Get product counts for each seller
      const sellersWithCounts = await Promise.all(
        (sellersData || []).map(async (seller) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', seller.user_id)
            .eq('status', 'active');
          
          return {
            ...seller,
            product_count: count || 0
          };
        })
      );

      // Filter sellers with at least 1 product
      const activeSellers = sellersWithCounts.filter(s => s.product_count > 0);
      setSellers(activeSellers);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const siteUrl = "https://salemylink.com";
  const pageUrl = `${siteUrl}/sellers`;

  // Structured data for sellers page
  const sellersStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": pageUrl,
      "name": "Người bán sản phẩm Digital - Salemylink.com",
      "description": `Khám phá ${sellers.length} người bán uy tín trên Salemylink.com. Mua sản phẩm digital chất lượng từ các seller được xác minh.`,
      "url": pageUrl,
      "isPartOf": {
        "@id": `${siteUrl}/#website`
      },
      "breadcrumb": {
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
            "item": pageUrl
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Danh sách người bán",
        "numberOfItems": sellers.length,
        "itemListElement": sellers.slice(0, 20).map((seller, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Person",
            "@id": `${siteUrl}/seller/${seller.user_id}`,
            "name": seller.full_name || "Người bán",
            "url": `${siteUrl}/seller/${seller.user_id}`,
            "image": seller.avatar_url || undefined,
            "jobTitle": "Digital Product Seller",
            "worksFor": {
              "@type": "Organization",
              "name": "Salemylink.com"
            }
          }
        }))
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
          "item": pageUrl
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Người bán sản phẩm Digital uy tín | Salemylink.com"
        description={`Khám phá ${sellers.length}+ người bán uy tín trên Salemylink.com. Mua ebook, tài liệu, khóa học online từ các seller được xác minh với đánh giá cao.`}
        keywords="người bán digital, seller uy tín, bán ebook, bán tài liệu, bán khóa học, salemylink sellers, người bán sản phẩm số"
        url={pageUrl}
        structuredData={sellersStructuredData}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Người bán trên Salemylink</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Khám phá các người bán uy tín với sản phẩm digital chất lượng cao. 
            Mua sắm an toàn với hệ thống thanh toán bảo mật.
          </p>
          {!loading && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">{sellers.length} người bán</span>
            </div>
          )}
        </header>

        {/* Sellers Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Skeleton className="h-20 w-20 rounded-full mb-4" />
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Chưa có người bán nào trên nền tảng
            </p>
          </div>
        ) : (
          <section className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sellers.map((seller) => (
              <Link 
                key={seller.user_id} 
                to={`/seller/${seller.user_id}`}
                className="block"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      {/* Avatar */}
                      <Avatar className="h-20 w-20 mb-4 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                        <AvatarImage 
                          src={seller.avatar_url || undefined} 
                          alt={`Avatar của ${seller.full_name || 'Người bán'}`}
                        />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {getInitials(seller.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name & Verified Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {seller.full_name || 'Người bán'}
                        </h2>
                        {seller.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            Xác minh
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          <span>{seller.product_count} sản phẩm</span>
                        </div>
                      </div>

                      {/* Member since */}
                      <p className="text-xs text-muted-foreground">
                        Thành viên từ {formatDate(seller.created_at)}
                      </p>

                      {/* Total Sales */}
                      {(seller.total_sales || 0) > 0 && (
                        <Badge variant="outline" className="mt-3">
                          {new Intl.NumberFormat('vi-VN').format(seller.total_sales || 0)}đ doanh thu
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        )}

        {/* SEO Content */}
        <section className="mt-16 prose prose-gray dark:prose-invert max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">
            Tại sao nên mua từ người bán trên Salemylink?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 not-prose">
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">An toàn & Bảo mật</h3>
              <p className="text-sm text-muted-foreground">
                Thanh toán qua cổng PayOS uy tín, bảo vệ thông tin khách hàng
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Giao hàng tức thì</h3>
              <p className="text-sm text-muted-foreground">
                Nhận link tải ngay sau khi thanh toán thành công
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-semibold mb-2">Chất lượng đảm bảo</h3>
              <p className="text-sm text-muted-foreground">
                Sản phẩm được kiểm duyệt, có đánh giá từ người mua thực
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
