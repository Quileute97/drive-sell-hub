import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, TrendingUp } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function About() {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Về Salemylink.com - Nền tảng bán sản phẩm digital hàng đầu"
        description="Tìm hiểu về Salemylink.com - nền tảng thương mại điện tử hàng đầu cho sản phẩm digital tại Việt Nam. Sứ mệnh, tầm nhìn và giá trị cốt lõi của chúng tôi."
        keywords="về salemylink, giới thiệu, sứ mệnh, tầm nhìn, nền tảng digital, thương mại điện tử việt nam"
        url="https://salemylink.com/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "Về Salemylink.com",
          "description": "Nền tảng thương mại điện tử hàng đầu cho sản phẩm digital tại Việt Nam",
          "url": "https://salemylink.com/about"
        }}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Về Salemylink.com
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nền tảng thương mại điện tử hàng đầu cho sản phẩm digital tại Việt Nam. 
            Kết nối người mua và người bán một cách an toàn, nhanh chóng.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent className="p-8">
              <Target className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Sứ mệnh</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tạo ra một nền tảng đơn giản, an toàn và hiệu quả nhất để mọi người có thể 
                dễ dàng mua bán sản phẩm digital. Chúng tôi cam kết mang đến trải nghiệm 
                tốt nhất cho cả người mua và người bán.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-8">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Tầm nhìn</h2>
              <p className="text-muted-foreground leading-relaxed">
                Trở thành nền tảng bán sản phẩm digital số 1 Việt Nam, nơi mọi người tin tưởng 
                để chia sẻ kiến thức, kinh nghiệm và tài liệu của mình. Xây dựng cộng đồng 
                học tập và phát triển bền vững.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Uy tín</h3>
                <p className="text-muted-foreground">
                  Đặt lợi ích khách hàng lên hàng đầu, minh bạch trong mọi giao dịch
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Đổi mới</h3>
                <p className="text-muted-foreground">
                  Không ngừng cải tiến công nghệ để mang lại trải nghiệm tốt nhất
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Cộng đồng</h3>
                <p className="text-muted-foreground">
                  Xây dựng cộng đồng chia sẻ kiến thức và phát triển cùng nhau
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Story */}
        <section className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6">Câu chuyện của chúng tôi</h2>
              <div className="prose max-w-none text-muted-foreground space-y-4">
                <p>
                  Salemylink.com ra đời từ nhu cầu thực tế của cộng đồng người sáng tạo nội dung 
                  và các chuyên gia muốn chia sẻ kiến thức của mình. Chúng tôi nhận thấy rằng 
                  việc bán sản phẩm digital tại Việt Nam còn gặp nhiều khó khăn về thanh toán, 
                  bảo mật và phân phối.
                </p>
                <p>
                  Với sứ mệnh làm cho việc mua bán sản phẩm digital trở nên đơn giản và an toàn, 
                  chúng tôi đã phát triển một nền tảng tích hợp đầy đủ các tính năng cần thiết: 
                  thanh toán tự động, bảo vệ bản quyền, phân phối qua Google Drive, và hỗ trợ 
                  24/7.
                </p>
                <p>
                  Hôm nay, Salemylink.com tự hào là nơi kết nối hàng nghìn người bán và người mua 
                  sản phẩm digital. Chúng tôi không ngừng cải tiến để mang đến trải nghiệm tốt 
                  nhất cho cộng đồng.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
