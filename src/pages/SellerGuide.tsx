import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { 
  BookOpen, 
  FileText, 
  DollarSign, 
  Shield,
  TrendingUp,
  Lightbulb,
  AlertCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";

export default function SellerGuide() {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Hướng dẫn bán hàng sản phẩm digital"
        description="Hướng dẫn chi tiết cách bán sản phẩm digital trên Salemylink. Từ chuẩn bị sản phẩm, upload lên Drive, tạo listing đến tăng doanh số hiệu quả."
        keywords="hướng dẫn seller, bán hàng online, kiếm tiền digital, bán ebook, bán tài liệu, google drive, tăng doanh số"
        url="https://salemylink.com/seller-guide"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Hướng dẫn bán hàng sản phẩm digital",
            "description": "Hướng dẫn chi tiết cách bán sản phẩm digital trên Salemylink. Từ chuẩn bị sản phẩm, upload lên Drive, tạo listing đến tăng doanh số hiệu quả.",
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
              "@id": "https://salemylink.com/seller-guide"
            },
            "articleSection": "Hướng dẫn",
            "wordCount": 1500
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
                "name": "Hướng dẫn bán hàng",
                "item": "https://salemylink.com/seller-guide"
              }
            ]
          }
        ]}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Hướng dẫn bán hàng
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tất cả những gì bạn cần biết để bắt đầu kinh doanh sản phẩm digital 
            thành công trên Salemylink.com
          </p>
        </section>

        {/* Quick Start */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Lightbulb className="h-6 w-6 mr-2 text-primary" />
                Bắt đầu nhanh
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">1. Đăng ký tài khoản</h3>
                  <p className="text-sm text-muted-foreground">
                    Tạo tài khoản seller với email và thông tin cơ bản
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Tải sản phẩm lên</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload file lên Google Drive và tạo sản phẩm trên Salemylink
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Bắt đầu bán</h3>
                  <p className="text-sm text-muted-foreground">
                    Sản phẩm được duyệt và hiển thị cho khách hàng
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Detailed Guide */}
        <section className="space-y-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Hướng dẫn chi tiết</h2>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-4">Chuẩn bị sản phẩm</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p><strong>Định dạng file:</strong> PDF, DOCX, XLSX, PPTX, ZIP, MP4, MP3... Dung lượng tối đa 2GB</p>
                    <p><strong>Chất lượng:</strong> Đảm bảo nội dung chất lượng cao, không vi phạm bản quyền</p>
                    <p><strong>Mô tả:</strong> Viết mô tả chi tiết, thu hút. Thêm ảnh minh họa rõ ràng</p>
                    <p><strong>Giá cả:</strong> Định giá hợp lý dựa trên giá trị và thị trường</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-4">Upload lên Google Drive</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p><strong>Bước 1:</strong> Tải file sản phẩm lên Google Drive của bạn</p>
                    <p><strong>Bước 2:</strong> Nhấp chuột phải vào file → Chia sẻ → Lấy liên kết</p>
                    <p><strong>Bước 3:</strong> Chọn "Bất kỳ ai có liên kết đều có thể xem"</p>
                    <p><strong>Bước 4:</strong> Sao chép link và dán vào form tạo sản phẩm</p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4 flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900 dark:text-yellow-200">
                        <strong>Lưu ý:</strong> Không xóa file khỏi Drive sau khi đã bán. Khách hàng sẽ không tải được.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <BookOpen className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-4">Tạo sản phẩm trên Salemylink</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p><strong>Tiêu đề:</strong> Ngắn gọn, súc tích, chứa từ khóa chính (tối đa 100 ký tự)</p>
                    <p><strong>Mô tả ngắn:</strong> Tóm tắt sản phẩm trong 1-2 câu (tối đa 200 ký tự)</p>
                    <p><strong>Mô tả chi tiết:</strong> Giải thích đầy đủ về nội dung, lợi ích, phù hợp với ai</p>
                    <p><strong>Danh mục:</strong> Chọn danh mục phù hợp để khách hàng dễ tìm thấy</p>
                    <p><strong>Tags:</strong> Thêm từ khóa liên quan để tăng khả năng hiển thị</p>
                    <p><strong>Giá:</strong> Nhập giá bán (VNĐ). Có thể thêm giá gốc để hiển thị % giảm giá</p>
                    <p><strong>Ảnh đại diện:</strong> Upload ảnh thumbnail chất lượng cao, kích thước 1200x630px</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <DollarSign className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-4">Quản lý đơn hàng và doanh thu</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p><strong>Dashboard:</strong> Theo dõi doanh số, đơn hàng, sản phẩm bán chạy</p>
                    <p><strong>Thông báo:</strong> Nhận email/SMS khi có đơn hàng mới</p>
                    <p><strong>Hoa hồng:</strong> Chỉ 5% phí dịch vụ, bạn giữ lại 95% doanh thu</p>
                    <p><strong>Rút tiền:</strong> Rút về tài khoản ngân hàng mỗi tuần hoặc khi đạt ngưỡng tối thiểu</p>
                    <p><strong>Báo cáo:</strong> Xuất báo cáo chi tiết theo ngày, tuần, tháng</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <TrendingUp className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-4">Mẹo tăng doanh số</h3>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li>Viết tiêu đề hấp dẫn, chứa từ khóa người mua tìm kiếm</li>
                    <li>Sử dụng ảnh thumbnail chuyên nghiệp, bắt mắt</li>
                    <li>Mô tả chi tiết giá trị sản phẩm mang lại</li>
                    <li>Định giá cạnh tranh so với thị trường</li>
                    <li>Thường xuyên cập nhật sản phẩm mới</li>
                    <li>Tương tác với khách hàng, trả lời câu hỏi nhanh chóng</li>
                    <li>Tạo combo sản phẩm với giá ưu đãi</li>
                    <li>Chia sẻ sản phẩm trên mạng xã hội</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 opacity-90">
            Tham gia cùng hàng nghìn người bán đang kiếm tiền với sản phẩm digital
          </p>
          <Link to="/seller-signup">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Đăng ký bán hàng ngay
            </Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
