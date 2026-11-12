import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import {
  BookOpen,
  GraduationCap,
  Palette,
  Code,
  Music,
  Camera,
  FileText,
  Presentation,
  ArrowRight,
  FolderKanban,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
  BookOpen,
  GraduationCap,
  Palette,
  Code,
  Music,
  Camera,
  FileText,
  Presentation,
};

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  product_count: number;
};

const fallbackCategories: CategoryItem[] = [
  { id: "cat-1", name: "Tài liệu học tập", slug: "tai-lieu-hoc-tap", icon: "BookOpen", product_count: 120 },
  { id: "cat-2", name: "Khóa học online", slug: "khoa-hoc-online", icon: "GraduationCap", product_count: 85 },
  { id: "cat-3", name: "Ebook - Sách điện tử", slug: "ebook-sach-dien-tu", icon: "FileText", product_count: 60 },
  { id: "cat-4", name: "Source Code & Lập trình", slug: "source-code-lap-trinh", icon: "Code", product_count: 45 },
  { id: "cat-5", name: "Đồ họa & Thiết kế", slug: "do-hoa-thiet-ke", icon: "Palette", product_count: 50 },
  { id: "cat-6", name: "Slide & Thuyết trình", slug: "slide-thuyet-trinh", icon: "Presentation", product_count: 40 },
  { id: "cat-7", name: "Template & Biểu mẫu", slug: "template-bieu-mau", icon: "FileText", product_count: 35 },
  { id: "cat-8", name: "Nhiếp ảnh & Video", slug: "nhiep-anh-video", icon: "Camera", product_count: 25 },
];

export const Categories = ({
  initialCategories,
}: {
  initialCategories?: any[] | undefined;
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || "BookOpen",
        product_count: Number(c.product_count) || 0,
      }));
    }
    return fallbackCategories;
  });

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;

    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, icon, products(id, status)")
          .eq("is_active", true)
          .order("sort_order");

        if (error || cancelled) return;

        const formatted = (data || []).map((category: any) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon || "BookOpen",
          product_count: Array.isArray(category.products)
            ? category.products.filter((p: any) => !p.status || p.status === "active").length
            : 0,
        }));

        if (formatted.length > 0) setCategories(formatted);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [initialCategories]);

  return (
    <section
      className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8"
      aria-labelledby="categories-heading"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <FolderKanban className="h-3.5 w-3.5" />
            <span>Chủ đề nổi bật</span>
          </div>
          <h2
            id="categories-heading"
            className="mt-0.5 text-xl font-bold tracking-tight text-balance text-foreground sm:text-2xl"
          >
            Danh mục sản phẩm
          </h2>
        </div>

        <Link
          to="/search"
          className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
        >
          <span>Khám phá tất cả</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon] || BookOpen;
          return (
            <Link
              key={category.id}
              to={`/danh-muc/${category.slug}`}
              className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-3.5 sm:p-4 transition-colors hover:bg-[#eef1f8]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  {category.product_count} sản phẩm
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 sm:hidden">
        <Button variant="outline" className="w-full h-12" asChild>
          <Link to="/search">
            <span>Khám phá tất cả danh mục</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};
