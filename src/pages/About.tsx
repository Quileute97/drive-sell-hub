import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, Heart, TrendingUp, ArrowRight } from "lucide-react";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { SEO } from "@/components/SEO";

export default function About() {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Về Salemylink - Nền tảng sản phẩm digital"
        description="Tìm hiểu về Salemylink - nền tảng thương mại điện tử hàng đầu cho sản phẩm digital tại Việt Nam. Sứ mệnh, tầm nhìn và giá trị cốt lõi của chúng tôi."
        keywords="về salemylink, giới thiệu, sứ mệnh, tầm nhìn, nền tảng digital, thương mại điện tử việt nam"
        url="https://salemylink.com/about"
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

        {/* Community Telegram CTA */}
        <section className="mb-16">
          <Card className="border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-primary/5 to-accent/10 shadow-lg">
            <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
                  <TelegramIcon className="w-3.5 h-3.5" />
                  <span>Cộng đồng chính thức</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Gia nhập Group Telegram Salemylink
                </h2>
                <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
                  Giao lưu cùng hàng ngàn tác giả, người bán và độc giả. Nhận tài liệu chọn lọc miễn phí, thông báo khuyến mãi và hỗ trợ trực tiếp 24/7.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-[#229ED9] hover:bg-[#1b85b8] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all shrink-0"
                asChild
              >
                <a href="https://t.me/+2ZkLgrmVJgBkMGM1" target="_blank" rel="noopener noreferrer">
                  <TelegramIcon className="w-5 h-5 mr-2 fill-white" />
                  Tham gia Group ngay
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
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
