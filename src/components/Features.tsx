import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Zap, 
  DollarSign, 
  FileText, 
  Users, 
  BarChart3,
  Globe,
  Headphones
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Sản phẩm đa dạng",
    description: "Từ tài liệu, ebook, khóa học đến template và nhiều hơn nữa",
    color: "text-blue-600"
  },
  {
    icon: Shield,
    title: "Bảo mật tuyệt đối",
    description: "Link Google Drive an toàn, chống sao chép trái phép",
    color: "text-green-600"
  },
  {
    icon: Zap,
    title: "Giao dịch nhanh chóng",
    description: "Thanh toán và nhận sản phẩm trong tích tắc",
    color: "text-yellow-600"
  },
  {
    icon: DollarSign,
    title: "Hoa hồng thấp",
    description: "Chỉ 5% phí dịch vụ, giữ lại 95% doanh thu của bạn",
    color: "text-purple-600"
  },
  {
    icon: BarChart3,
    title: "Dashboard thông minh",
    description: "Theo dõi doanh số, đơn hàng và khách hàng chi tiết",
    color: "text-orange-600"
  },
  {
    icon: Users,
    title: "Cộng đồng lớn",
    description: "Kết nối với hàng nghìn người bán khác",
    color: "text-pink-600"
  },
  {
    icon: Globe,
    title: "Tiếp cận toàn cầu",
    description: "Bán cho khách hàng trên toàn thế giới",
    color: "text-indigo-600"
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chăm sóc khách hàng chuyên nghiệp",
    color: "text-red-600"
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-background" aria-labelledby="features-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-16 animate-fade-in-up">
          <h2 id="features-heading" className="text-3xl lg:text-5xl font-bold mb-6">
            Tại sao chọn 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Salemylink?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nền tảng toàn diện giúp bạn kinh doanh sản phẩm digital hiệu quả nhất
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};