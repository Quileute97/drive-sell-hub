import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  UserPlus, 
  Upload, 
  ShoppingBag, 
  Download,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Cách thức hoạt động - Mua bán sản phẩm digital"
        description="Tìm hiểu cách mua và bán sản phẩm digital trên Salemylink. Quy trình đơn giản chỉ với 4 bước cho người bán và 3 bước cho người mua."
        keywords="hướng dẫn bán hàng, cách thức hoạt động, mua bán digital, quy trình thanh toán, bán tài liệu online"
        url="https://salemylink.com/how-it-works"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Cách thức hoạt động - Mua bán sản phẩm digital",
            "description": "Tìm hiểu cách mua và bán sản phẩm digital trên Salemylink. Quy trình đơn giản chỉ với 4 bước cho người bán và 3 bước cho người mua.",
            "image": "https://salemylink.com/og-image.png",
            "datePublished": "2024-01-01T00:00:00+07:00",
            "dateModified": "2025-01-01T00:00:00+07:00",
            "author": {
              "@type": "Organization",
              "name": "Salemylink.com",
              "url": "https://salemylink.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Salemylink.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://salemylink.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://salemylink.com/how-it-works"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Cách mua bán sản phẩm digital trên Salemylink",
            "description": "Hướng dẫn chi tiết quy trình mua bán sản phẩm digital",
            "totalTime": "PT10M",
            "step": [
              {
                "@type": "HowToStep",
                "position": 1,
                "name": "Đăng ký tài khoản",
                "text": "Tạo tài khoản người bán miễn phí và xác minh thông tin"
              },
              {
                "@type": "HowToStep",
                "position": 2,
                "name": "Upload sản phẩm",
                "text": "Tải sản phẩm lên Google Drive và tạo listing"
              },
              {
                "@type": "HowToStep",
                "position": 3,
                "name": "Nhận đơn hàng",
                "text": "Khách hàng mua và thanh toán tự động"
              },
              {
                "@type": "HowToStep",
                "position": 4,
                "name": "Rút tiền",
                "text": "Rút doanh thu về tài khoản ngân hàng"
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Trang chủ",
                "item": "https://salemylink.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Cách thức hoạt động",
                "item": "https://salemylink.com/how-it-works"
              }
            ]
          }
        ]}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Cách thức hoạt động
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bán và mua sản phẩm digital chưa bao giờ dễ dàng đến thế. 
            Chỉ với 4 bước đơn giản, bạn đã có thể bắt đầu kiếm tiền hoặc sở hữu sản phẩm mong muốn.
          </p>
        </section>

        {/* For Sellers */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Dành cho <span className="text-primary">Người bán</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <CardContent className="p-6 pt-12">
                <UserPlus className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Đăng ký tài khoản</h3>
                <p className="text-muted-foreground">
                  Tạo tài khoản người bán miễn phí chỉ trong vài phút. Xác minh thông tin để được phê duyệt.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <CardContent className="p-6 pt-12">
                <Upload className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Upload sản phẩm</h3>
                <p className="text-muted-foreground">
                  Tải sản phẩm lên Google Drive của bạn, tạo link chia sẻ và thêm thông tin chi tiết.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <CardContent className="p-6 pt-12">
                <ShoppingBag className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Nhận đơn hàng</h3>
                <p className="text-muted-foreground">
                  Khách hàng mua sản phẩm, thanh toán tự động. Bạn sẽ nhận thông báo ngay lập tức.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <CardContent className="p-6 pt-12">
                <Download className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Rút tiền</h3>
                <p className="text-muted-foreground">
                  Theo dõi doanh thu trên dashboard và rút tiền về tài khoản ngân hàng của bạn.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/seller-signup">
              <Button size="lg" variant="hero">
                Bắt đầu bán hàng ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* For Buyers */}
        <section className="mb-20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-center mb-12">
            Dành cho <span className="text-primary">Người mua</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Tìm sản phẩm</h3>
                <p className="text-muted-foreground">
                  Duyệt qua hàng nghìn sản phẩm digital chất lượng cao trong mọi lĩnh vực. 
                  Sử dụng bộ lọc để tìm chính xác những gì bạn cần.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Thanh toán</h3>
                <p className="text-muted-foreground">
                  Thanh toán an toàn qua cổng thanh toán PayOS. Hỗ trợ nhiều phương thức: 
                  thẻ, ví điện tử, chuyển khoản ngân hàng.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Nhận sản phẩm</h3>
                <p className="text-muted-foreground">
                  Nhận link tải ngay sau khi thanh toán thành công. Tải về không giới hạn 
                  trong thời gian quy định.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/">
              <Button size="lg" variant="outline">
                Khám phá sản phẩm
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">
            Lợi ích khi sử dụng Salemylink
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Hoa hồng chỉ 5% - thấp nhất thị trường",
              "Thanh toán tự động, rút tiền nhanh chóng",
              "Bảo mật tuyệt đối với Google Drive",
              "Hỗ trợ 24/7 từ đội ngũ chuyên nghiệp",
              "Dashboard thông minh theo dõi doanh số",
              "Cộng đồng người bán năng động"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
