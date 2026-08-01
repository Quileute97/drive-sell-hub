import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

export default function PrivacyPolicy() {
  const lastUpdated = "2025-01-15";
  
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://salemylink.com/privacy-policy",
      "name": "Chính sách bảo mật - Salemylink",
      "description": "Chính sách bảo mật của Salemylink. Tìm hiểu cách chúng tôi bảo vệ thông tin cá nhân của bạn.",
      "url": "https://salemylink.com/privacy-policy",
      "datePublished": "2024-01-01T00:00:00+07:00",
      "dateModified": `${lastUpdated}T00:00:00+07:00`,
      "inLanguage": "vi-VN",
      "isPartOf": {
        "@id": "https://salemylink.com/#website"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Salemylink",
        "url": "https://salemylink.com"
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
          "item": "https://salemylink.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Chính sách bảo mật",
          "item": "https://salemylink.com/privacy-policy"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Chính sách bảo mật"
        description="Chính sách bảo mật Salemylink. Tìm hiểu cách chúng tôi bảo vệ thông tin cá nhân của bạn."
        keywords="chính sách bảo mật, privacy policy, bảo mật thông tin, salemylink, quyền riêng tư, dữ liệu cá nhân"
        url="https://salemylink.com/privacy-policy"
        structuredData={structuredData}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Chính sách bảo mật</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: {new Date(lastUpdated).toLocaleDateString('vi-VN')}</p>

        <div className="prose max-w-none space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">1. Thông tin chúng tôi thu thập</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Khi bạn sử dụng Salemylink.com, chúng tôi có thể thu thập các thông tin sau:</p>
                
                <h3 className="font-semibold text-foreground mt-4">1.1. Thông tin cá nhân</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Họ tên, email, số điện thoại</li>
                  <li>Địa chỉ (nếu cần thiết)</li>
                  <li>Thông tin tài khoản ngân hàng (cho người bán)</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-4">1.2. Thông tin giao dịch</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Lịch sử mua hàng</li>
                  <li>Thông tin thanh toán</li>
                  <li>Sản phẩm đã tải xuống</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-4">1.3. Thông tin kỹ thuật</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Địa chỉ IP</li>
                  <li>Loại trình duyệt và thiết bị</li>
                  <li>Cookies và dữ liệu theo dõi</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">2. Cách chúng tôi sử dụng thông tin</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Thông tin thu thập được sử dụng cho các mục đích sau:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Xử lý đơn hàng và giao dịch thanh toán</li>
                  <li>Cung cấp dịch vụ khách hàng và hỗ trợ kỹ thuật</li>
                  <li>Gửi thông báo về đơn hàng, sản phẩm mới, khuyến mãi</li>
                  <li>Cải thiện trải nghiệm người dùng và tính năng website</li>
                  <li>Phát hiện và ngăn chặn gian lận</li>
                  <li>Tuân thủ các yêu cầu pháp lý</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">3. Chia sẻ thông tin</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Chúng tôi cam kết không bán hoặc cho thuê thông tin cá nhân của bạn. 
                   Thông tin chỉ được chia sẻ trong các trường hợp sau:</p>
                
                <h3 className="font-semibold text-foreground mt-4">3.1. Với đối tác dịch vụ</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cổng thanh toán (PayOS) để xử lý giao dịch</li>
                  <li>Dịch vụ lưu trữ (Google Drive, Supabase)</li>
                  <li>Dịch vụ email và SMS</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-4">3.2. Yêu cầu pháp lý</h3>
                <p>Khi được yêu cầu bởi cơ quan có thẩm quyền hoặc để tuân thủ pháp luật.</p>

                <h3 className="font-semibold text-foreground mt-4">3.3. Bảo vệ quyền lợi</h3>
                <p>Để bảo vệ quyền, tài sản, an toàn của Salemylink.com và người dùng.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">4. Bảo mật thông tin</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ thông tin của bạn:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mã hóa SSL/TLS cho tất cả kết nối</li>
                  <li>Mã hóa dữ liệu nhạy cảm trong database</li>
                  <li>Kiểm soát truy cập nghiêm ngặt</li>
                  <li>Giám sát và phát hiện bất thường 24/7</li>
                  <li>Sao lưu dữ liệu định kỳ</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Website sử dụng cookies để:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Duy trì phiên đăng nhập</li>
                  <li>Ghi nhớ tùy chọn người dùng</li>
                  <li>Phân tích lưu lượng truy cập</li>
                  <li>Cải thiện trải nghiệm người dùng</li>
                </ul>
                <p className="mt-4">Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số tính năng có thể không hoạt động.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">6. Quyền của người dùng</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Bạn có các quyền sau đối với thông tin cá nhân:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Truy cập:</strong> Yêu cầu xem thông tin chúng tôi lưu trữ về bạn</li>
                  <li><strong>Chỉnh sửa:</strong> Cập nhật hoặc sửa đổi thông tin không chính xác</li>
                  <li><strong>Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
                  <li><strong>Từ chối:</strong> Từ chối nhận email marketing (vẫn nhận email giao dịch)</li>
                  <li><strong>Khiếu nại:</strong> Phản ánh về cách chúng tôi xử lý dữ liệu</li>
                </ul>
                <p className="mt-4">Để thực hiện các quyền này, vui lòng liên hệ: support@salemylink.com</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">7. Lưu trữ thông tin</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Thông tin của bạn được lưu trữ:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Trong suốt thời gian tài khoản còn hoạt động</li>
                  <li>Thêm 12 tháng sau khi đóng tài khoản (cho mục đích pháp lý)</li>
                  <li>Dữ liệu thanh toán được lưu theo quy định pháp luật (tối thiểu 5 năm)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">8. Quyền riêng tư của trẻ em</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Dịch vụ của chúng tôi dành cho người từ 18 tuổi trở lên. 
                   Chúng tôi không cố ý thu thập thông tin từ trẻ em dưới 18 tuổi. 
                   Nếu phát hiện, chúng tôi sẽ xóa ngay lập tức.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">9. Cập nhật chính sách</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Chính sách bảo mật có thể được cập nhật định kỳ. 
                   Chúng tôi sẽ thông báo về các thay đổi quan trọng qua email hoặc thông báo trên website. 
                   Việc tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách mới.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">10. Liên hệ</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:</p>
                <ul className="list-none space-y-2 mt-4">
                  <li><strong>Email:</strong> support@salemylink.com</li>
                  <li><strong>Hotline:</strong> 1900-xxxx</li>
                  <li><strong>Địa chỉ:</strong> Hà Nội, Việt Nam</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
