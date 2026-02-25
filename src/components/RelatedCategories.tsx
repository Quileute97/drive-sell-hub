import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FolderOpen } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  product_count?: number;
}

interface RelatedCategoriesProps {
  /** Current category ID to exclude from the list */
  currentCategoryId?: string;
  /** Max number of categories to show */
  maxItems?: number;
  /** Heading text */
  title?: string;
}

export const RelatedCategories = ({ 
  currentCategoryId, 
  maxItems = 8,
  title = "Khám phá danh mục khác"
}: RelatedCategoriesProps) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [currentCategoryId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, icon')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      let filtered = data || [];
      if (currentCategoryId) {
        filtered = filtered.filter(c => c.id !== currentCategoryId);
      }

      // Fetch product counts for each category
      const withCounts = await Promise.all(
        filtered.slice(0, maxItems).map(async (cat) => {
          const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('status', 'active');
          return { ...cat, product_count: count || 0 };
        })
      );

      setCategories(withCounts.filter(c => c.product_count > 0));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || categories.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="related-categories-heading">
      <div className="mb-6 flex items-center justify-between">
        <h2 
          id="related-categories-heading" 
          className="text-2xl font-bold flex items-center gap-2"
        >
          <FolderOpen className="h-6 w-6 text-primary" />
          {title}
        </h2>
        <Link 
          to="/"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Tất cả danh mục
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <nav aria-label="Danh mục liên quan">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group block p-4 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                  {cat.name}
                </h3>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
              </div>
              {cat.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {cat.description}
                </p>
              )}
              <Badge variant="secondary" className="text-xs">
                {cat.product_count} sản phẩm
              </Badge>
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
};
