import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  GraduationCap, 
  Palette, 
  Code, 
  Music, 
  Camera,
  FileText,
  Presentation,
  ArrowRight
} from "lucide-react";

const categories = [
  {
    icon: BookOpen,
    name: "Ebook & Tài liệu",
    count: "15,234",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: GraduationCap,
    name: "Khóa học Online",
    count: "8,567",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Palette,
    name: "Template & Design",
    count: "12,890",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Code,
    name: "Source Code",
    count: "5,432",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Music,
    name: "Audio & Music",
    count: "7,654",
    color: "from-pink-500 to-pink-600"
  },
  {
    icon: Camera,
    name: "Video & Phim",
    count: "9,123",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: FileText,
    name: "Báo cáo & Luận văn",
    count: "6,789",
    color: "from-teal-500 to-teal-600"
  },
  {
    icon: Presentation,
    name: "Slide & Presentation",
    count: "4,321",
    color: "from-red-500 to-red-600"
  }
];

export const Categories = () => {
  return (
    <section className="py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Danh mục 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}sản phẩm
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Khám phá hàng nghìn sản phẩm digital chất lượng cao trong mọi lĩnh vực
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card 
              key={index}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <CardContent className="p-6 text-center">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {category.count} sản phẩm
                </p>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                >
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="accent" size="lg" className="group">
            Khám phá tất cả danh mục
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};