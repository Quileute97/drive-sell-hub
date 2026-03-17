import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface TagCount {
  tag: string;
  count: number;
}

export function PopularTags() {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularTags();
  }, []);

  const fetchPopularTags = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("tags")
        .eq("status", "active")
        .not("tags", "is", null);

      if (error) throw error;

      // Count tag frequency
      const tagMap = new Map<string, number>();
      (data || []).forEach((product) => {
        (product.tags || []).forEach((tag: string) => {
          const normalized = tag.trim();
          if (normalized) {
            tagMap.set(normalized, (tagMap.get(normalized) || 0) + 1);
          }
        });
      });

      // Sort by count descending, take top 30
      const sorted = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

      setTags(sorted);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-48" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded-full w-20" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (tags.length === 0) return null;

  const maxCount = tags[0]?.count || 1;

  // Size tiers based on relative frequency
  const getSize = (count: number): string => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "text-base font-semibold px-4 py-1.5";
    if (ratio > 0.4) return "text-sm font-medium px-3 py-1";
    return "text-xs px-2.5 py-0.5";
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Tags phổ biến</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Khám phá sản phẩm theo chủ đề bạn quan tâm
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(({ tag, count }) => (
            <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`}>
              <Badge
                variant="outline"
                className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${getSize(count)}`}
              >
                {tag}
                <span className="ml-1.5 text-muted-foreground text-[10px]">({count})</span>
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
