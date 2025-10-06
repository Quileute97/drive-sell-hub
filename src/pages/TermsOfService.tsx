import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Điều khoản sử dụng</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

        <div className="prose max-w-none space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">1. Chấp nhận điều khoản</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Chào mừng bạn đến với Salemylink.com. Bằng việc truy cập và sử dụng nền tảng của chúng tôi, 
                   bạn đồng ý tuân theo các điều khoản và điều kiện sau đây.</p>
                <p>Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">2. Định nghĩa</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>"Nền tảng"</strong>: Website Salemylink.com và tất cả dịch vụ liên quan</li>
                  <li><strong>"Người dùng"</strong>: Bất kỳ cá nhân hoặc tổ chức sử dụng nền tảng</li>
                  <li><strong>"Người bán"</strong>: Người dùng đăng ký bán sản phẩm digital trên nền tảng</li>
                  <li><strong>"Người mua"</strong>: Người dùng mua sản phẩm digital trên nền tảng</li>
                  <li><strong>"Sản phẩm digital"</strong>: Tài liệu, ebook, khóa học, template và các file kỹ thuật số khác</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">3. Đăng ký tài khoản</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-foreground mt-4">3.1. Yêu cầu đăng ký</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bạn phải đủ 18 tuổi trở lên</li>
                  <li>Cung cấp thông tin chính xác, đầy đủ</li>
                  <li>Duy trì tính bảo mật của tài khoản</li>
                  <li>Chịu trách nhiệm về mọi hoạt động dưới tài khoản của bạn</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-4">3.2. Tài khoản người bán</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cần xác minh danh tính và thông tin liên hệ</li>
                  <li>Cung cấp thông tin tài khoản ngân hàng hợp lệ</li>
                  <li>Tuân thủ các quy định về bán hàng</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">4. Quy định về sản phẩm</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-foreground mt-4">4.1. Sản phẩm được phép</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tài liệu học tập, nghiên cứu</li>
                  <li>Ebook, sách điện tử</li>
                  <li>Khóa học online (video, audio)</li>
                  <li>Template, mẫu thiết kế</li>
                  <li>Phần mềm, công cụ (có bản quyền)</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-4">4.2. Sản phẩm bị cấm</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nội dung vi phạm bản quyền</li>
                  <li>Nội dung khiêu dâm, bạo lực</li>
                  <li>Nội dung kích động thù hận, phân biệt đối xử</li>
                  <li>Phần mềm crack, key bất hợp pháp</li>
                  <li>Thông tin cá nhân, dữ liệu đánh cắp</li>
                  <li>Sản phẩm lừa đảo, gian lận</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">5. Trách nhiệm người bán</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Đảm bảo sở hữu bản quyền hoặc có quyền bán sản phẩm</li>
                  <li>Mô tả sản phẩm chính xác, trung thực</li>
                  <li>Duy trì link tải sản phẩm luôn khả dụng</li>
                  <li>Hỗ trợ người mua khi có vấn đề kỹ thuật</li>
                  <li>Không spam, gian lận, thao túng hệ thống</li>
                  <li>Tuân thủ pháp luật Việt Nam về thương mại điện tử</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">6. Trách nhiệm người mua</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Thanh toán đầy đủ, đúng hạn</li>
                  <li>Sử dụng sản phẩm đúng mục đích, không vi phạm bản quyền</li>
                  <li>Không chia sẻ link tải cho người khác</li>
                  <li>Không sao chép, phân phối lại sản phẩm</li>
                  <li>Đánh giá trung thực, khách quan</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">7. Thanh toán và phí dịch vụ</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-foreground mt-4">7.1. Phí người bán</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Hoa hồng: 5% trên mỗi giao dịch thành công</li>
                  <li>Phí rút tiền: Theo chính sách ngân hàng</li>
                  <li>Không có phí đăng ký, phí tháng</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-4">7.2. Thanh toán</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Người mua thanh toán qua cổng PayOS</li>
                  <li>Tiền được giữ trong hệ thống đến khi giao dịch hoàn tất</li>
                  <li>Người bán nhận tiền sau 7 ngày hoặc theo yêu cầu rút tiền</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">8. Hoàn tiền</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Chính sách hoàn tiền được áp dụng trong các trường hợp:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Link tải không hoạt động sau 48h</li>
                  <li>Sản phẩm không đúng mô tả</li>
                  <li>File bị lỗi, không mở được</li>
                  <li>Thanh toán trùng lặp</li>
                </ul>
                <p className="mt-4"><strong>Lưu ý:</strong> Không hoàn tiền nếu người mua đã tải về thành công và sản phẩm hoạt động bình thường.</p>
                <p>Thời gian xét duyệt hoàn tiền: 3-5 ngày làm việc</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">9. Sở hữu trí tuệ</h2>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Người bán giữ quyền sở hữu trí tuệ đối với sản phẩm của mình</li>
                  <li>Người mua được cấp quyền sử dụng cá nhân, không được phân phối lại</li>
                  <li>Salemylink.com giữ quyền sở hữu đối với nền tảng, logo, thương hiệu</li>
                  <li>Nghiêm cấm sao chép, bắt chước giao diện, tính năng của nền tảng</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">10. Vi phạm và xử lý</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Chúng tôi có quyền:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cảnh cáo, tạm khóa hoặc xóa vĩnh viễn tài khoản vi phạm</li>
                  <li>Gỡ bỏ sản phẩm vi phạm mà không cần thông báo trước</li>
                  <li>Giữ lại tiền trong tài khoản vi phạm để xử lý khiếu nại</li>
                  <li>Báo cáo cho cơ quan chức năng nếu có hành vi vi phạm pháp luật</li>
                  <li>Từ chối phục vụ bất kỳ ai vì bất kỳ lý do gì</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">11. Giới hạn trách nhiệm</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Salemylink.com:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Là nền tảng trung gian, không chịu trách nhiệm về nội dung sản phẩm</li>
                  <li>Không đảm bảo sản phẩm luôn có sẵn, không lỗi</li>
                  <li>Không chịu trách nhiệm về tranh chấp giữa người mua và người bán</li>
                  <li>Không chịu trách nhiệm về thiệt hại gián tiếp, ngẫu nhiên</li>
                  <li>Trách nhiệm tối đa không vượt quá giá trị giao dịch</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">12. Thay đổi điều khoản</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Chúng tôi có quyền sửa đổi điều khoản này bất kỳ lúc nào. 
                   Thay đổi quan trọng sẽ được thông báo qua email hoặc banner trên website.</p>
                <p>Việc tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận điều khoản mới.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">13. Luật áp dụng</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. 
                   Mọi tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền tại Hà Nội, Việt Nam.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">14. Liên hệ</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ:</p>
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
