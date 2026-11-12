import { useEffect, useState } from "react";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  product_count?: number;
}

interface RelatedCategoriesProps {
  currentCategoryId?: string;
  maxItems?: number;
  title?: string;
}

export const RelatedCategories = ({
  currentCategoryId,
  maxItems = 8,
  title = "Khám phá danh mục khác",
}: RelatedCategoriesProps) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, description, icon, products(id, status)")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error || cancelled) return;

        let filtered = (data || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          product_count: Array.isArray(cat.products)
            ? cat.products.filter((p: any) => !p.status || p.status === "active").length
            : 0,
        }));

        if (currentCategoryId) {
          filtered = filtered.filter((c) => c.id !== currentCategoryId);
        }

        setCategories(filtered.filter((c) => c.product_count > 0).slice(0, maxItems));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [currentCategoryId, maxItems]);

  if (loading || categories.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="related-categories-heading">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          id="related-categories-heading"
          className="flex min-w-0 items-center gap-2 text-base font-bold tracking-tight text-pretty text-foreground sm:text-xl"
        >
          <FolderOpen className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
          <span>{title}</span>
        </h2>
        <Link
          to="/search"
          className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-primary hover:underline sm:text-sm"
        >
          <span>Tất cả danh mục</span>
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>
      </div>

      <nav aria-label="Danh mục liên quan">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/danh-muc/${cat.slug}`}
              className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-3 sm:p-4 transition-colors hover:bg-[#eef1f8]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-pretty text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-pretty text-muted-foreground">
                    {cat.description}
                  </p>
                )}
              </div>
              <div className="mt-2.5">
                <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground tabular-nums">
                  {cat.product_count} tài liệu
                </span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
};
