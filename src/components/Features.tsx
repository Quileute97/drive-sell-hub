import {
  Shield,
  Zap,
  DollarSign,
  FileText,
  Users,
  BarChart3,
  Globe,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Sản phẩm đa dạng",
    description: "Từ tài liệu, ebook, khóa học đến template và nhiều hơn nữa",
  },
  {
    icon: Shield,
    title: "Bảo mật tuyệt đối",
    description: "Link Google Drive an toàn, bảo vệ quyền lợi tác giả",
  },
  {
    icon: Zap,
    title: "Giao dịch nhanh chóng",
    description: "Thanh toán và nhận sản phẩm trong tích tắc",
  },
  {
    icon: DollarSign,
    title: "Hoa hồng thấp",
    description: "Chỉ 5% phí dịch vụ, giữ lại 95% doanh thu của bạn",
  },
  {
    icon: BarChart3,
    title: "Dashboard thông minh",
    description: "Theo dõi doanh số, đơn hàng và khách hàng chi tiết",
  },
  {
    icon: Users,
    title: "Cộng đồng lớn",
    description: "Kết nối với hàng nghìn người bán khác",
  },
  {
    icon: Globe,
    title: "Tiếp cận toàn cầu",
    description: "Bán cho khách hàng đa ngôn ngữ trên toàn thế giới",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chăm sóc khách hàng chuyên nghiệp",
  },
];

export const Features = () => {
  return (
    <section
      className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8"
      aria-labelledby="features-heading"
    >
      <div className="mb-6">
        <h2
          id="features-heading"
          className="text-xl font-bold tracking-tight text-balance text-foreground sm:text-2xl"
        >
          Tại sao chọn <span className="text-primary">Salemylink?</span>
        </h2>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">
          Nền tảng toàn diện giúp bạn tìm kiếm, đọc và kinh doanh tài liệu số hiệu quả
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-surface p-4 sm:p-5 transition-colors hover:border-border-strong"
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground sm:text-base">
              {feature.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-pretty text-muted-foreground sm:text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
