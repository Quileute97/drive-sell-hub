import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedCategories } from "@/components/RelatedCategories";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { EmptyState, ProductGridSkeleton } from "@/components/States";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "@/lib/router-compat";
import { getTagSeo } from "@/data/seoOverrides";
import { sanitizeImageArray, sanitizeImageUrl } from "@/lib/productImages";
import { fixVietnameseEncoding } from "@/lib/vietnameseText";

export default function TagProducts({
  initialProducts,
}: {
  initialProducts?: ProductCardData[];
}) {
  const { tag } = useParams<{ tag: string }>();
  const decodedTag = decodeURIComponent(tag || "");
  const [products, setProducts] = useState<ProductCardData[]>(
    initialProducts || []
  );
  const [relatedTags, setRelatedTags] = useState<string[]>(() => {
    if (!initialProducts || initialProducts.length === 0) return [];
    const tagSet = new Set<string>();
    initialProducts.forEach((p) => {
      (p.tags || []).forEach((t: string) => {
        if (t.toLowerCase() !== decodedTag.toLowerCase()) tagSet.add(t);
      });
    });
    return Array.from(tagSet).slice(0, 15);
  });
  const [loading, setLoading] = useState(!initialProducts);
  const [sortBy, setSortBy] = useState("newest");
  const { toast } = useToast();

  useEffect(() => {
    if (!decodedTag) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("products")
          .select(
            `
            id, slug, title, short_description, description, price, original_price,
            thumbnail_url, images, google_drive_link, download_only_link, read_only,
            download_count, view_count, rating_average, rating_count,
            file_format, file_size, tags, seller_id,
            profiles!products_seller_id_fkey(user_id, full_name, avatar_url, is_verified),
            categories(id, name, slug)
          `
          )
          .eq("status", "active")
          .contains("tags", [decodedTag]);

        switch (sortBy) {
          case "popular":
            query = query.order("download_count", { ascending: false });
            break;
          case "price_asc":
            query = query.order("price", { ascending: true });
            break;
          case "price_desc":
            query = query.order("price", { ascending: false });
            break;
          case "rating":
            query = query.order("rating_average", { ascending: false });
            break;
          case "newest":
          default:
            query = query.order("created_at", { ascending: false });
            break;
        }

        const { data, error } = await query;
        if (error) throw error;
        if (cancelled) return;

        const cleaned = (data || []).map((p: any) => ({
          ...p,
          title: fixVietnameseEncoding(p.title),
          short_description: p.short_description ? fixVietnameseEncoding(p.short_description) : null,
          thumbnail_url: sanitizeImageUrl(p.thumbnail_url),
          images: sanitizeImageArray(p.images),
        }));
        setProducts(cleaned);

        const tagSet = new Set<string>();
        cleaned.forEach((p: ProductCardData) => {
          (p.tags || []).forEach((t: string) => {
            if (t.toLowerCase() !== decodedTag.toLowerCase()) tagSet.add(t);
          });
        });
        setRelatedTags(Array.from(tagSet).slice(0, 15));
      } catch (error) {
        console.error("Error fetching products by tag:", error);
        if (!cancelled) {
          toast({
            title: "Lỗi",
            description: "Không thể tải sản phẩm",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [decodedTag, sortBy, toast]);

  const siteUrl = "https://salemylink.com";
  const canonicalUrl = `${siteUrl}/tag/${encodeURIComponent(decodedTag)}`;
  const tagSeo = getTagSeo(decodedTag);
  const metaDescription =
    products.length > 0
      ? `${tagSeo.description} Hiện có ${products.length} sản phẩm.`
      : tagSeo.description;
  const metaKeywords = [
    ...(tagSeo.keywords || []),
    decodedTag,
    "sản phẩm digital",
    "salemylink",
  ].join(", ");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={tagSeo.title}
        description={metaDescription}
        keywords={metaKeywords}
        url={canonicalUrl}
        type="website"
        ogTitle={tagSeo.ogTitle}
        ogDescription={`${tagSeo.ogDescription}${
          products.length > 0 ? ` Hiện có ${products.length} sản phẩm.` : ""
        }`}
        twTitle={tagSeo.twTitle}
        twDescription={tagSeo.twDescription}
      />

      <Header />

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: `Tag: #${decodedTag}` }]} />

        {/* Tag Header Card */}
        <header className="mb-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Tag className="h-3.5 w-3.5" />
                <span>Chủ đề / Từ khóa</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                #{decodedTag}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                {loading
                  ? "Đang tải..."
                  : `${products.length} tài liệu được gắn tag "${decodedTag}"`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                Sắp xếp:
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  aria-label="Sắp xếp sản phẩm theo tiêu chí"
                  className="h-12 sm:h-10 w-full sm:w-[180px]"
                >
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="popular">Phổ biến nhất</SelectItem>
                  <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                  <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                  <SelectItem value="rating">Đánh giá cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {relatedTags.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">
                Tags liên quan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {relatedTags.map((t) => (
                  <Link
                    key={t}
                    to={`/tag/${encodeURIComponent(t)}`}
                    className="inline-flex min-h-11 sm:min-h-8 items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground hover:bg-button-hover hover:text-primary transition-colors"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="Không tìm thấy sản phẩm"
            description={`Chưa có sản phẩm nào với tag "${decodedTag}". Thử khám phá từ khóa khác nhé.`}
            action={
              <Button asChild>
                <Link to="/search">Khám phá tài liệu khác</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={index < 3 ? "eager" : "lazy"}
                fetchPriority={index < 2 ? "high" : "auto"}
              />
            ))}
          </div>
        )}

        <RelatedCategories />
      </main>

      <Footer />
    </div>
  );
}
