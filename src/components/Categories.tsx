import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, any> = {
  BookOpen,
  GraduationCap,
  Palette,
  Code,
  Music,
  Camera,
  FileText,
  Presentation
};

const colorMap = [
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600", 
  "from-purple-500 to-purple-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-red-500 to-red-600"
];

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  product_count: number;
  color: string;
};

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          icon,
          products!inner(id)
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      const categoriesWithCount = categoriesData?.map((category: any, index: number) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon || 'BookOpen',
        product_count: category.products?.length || 0,
        color: colorMap[index % colorMap.length]
      })) || [];

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách danh mục",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Danh mục 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}sản phẩm
              </span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 gradient-subtle" aria-labelledby="categories-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-16 animate-fade-in-up">
          <h2 id="categories-heading" className="text-3xl lg:text-5xl font-bold mb-6">
            Danh mục 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}sản phẩm
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Khám phá hàng nghìn sản phẩm digital chất lượng cao trong mọi lĩnh vực
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || BookOpen;
            return (
              <Link 
                key={category.id}
                to={`/category/${category.slug}`}
              >
                <Card 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 h-full"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.product_count} sản phẩm
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
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/search">
            <Button variant="accent" size="lg" className="group">
              Khám phá tất cả danh mục
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
