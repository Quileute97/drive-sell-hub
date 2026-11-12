import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";

interface TagCount {
  tag: string;
  count: number;
}

const defaultPopularTags: TagCount[] = [
  { tag: "ielts", count: 48 },
  { tag: "y khoa", count: 35 },
  { tag: "luận văn", count: 28 },
  { tag: "toeic", count: 24 },
  { tag: "react", count: 20 },
  { tag: "canva", count: 18 },
  { tag: "excel", count: 16 },
  { tag: "english", count: 15 },
  { tag: "nội khoa", count: 14 },
  { tag: "hóa sinh", count: 12 },
  { tag: "nhi khoa", count: 12 },
  { tag: "ngoại khoa", count: 11 },
  { tag: "python", count: 10 },
  { tag: "photoshop", count: 10 },
  { tag: "powerpoint", count: 9 },
  { tag: "tiểu luận", count: 9 },
  { tag: "đồ án", count: 8 },
  { tag: "marketing", count: 8 },
];

export function PopularTags({
  initialTags,
}: {
  initialTags?: TagCount[] | undefined;
}) {
  const [tags, setTags] = useState<TagCount[]>(() =>
    initialTags && initialTags.length > 0 ? initialTags : defaultPopularTags
  );

  useEffect(() => {
    if (initialTags && initialTags.length > 0) {
      setTags(initialTags);
      return;
    }
    let cancelled = false;
    const fetchPopularTags = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("tags")
          .eq("status", "active")
          .not("tags", "is", null)
          .limit(500);

        if (error || cancelled) return;

        const tagMap = new Map<string, number>();
        (data || []).forEach((product) => {
          (product.tags || []).forEach((tag: string) => {
            const normalized = tag.trim();
            if (normalized) {
              tagMap.set(normalized, (tagMap.get(normalized) || 0) + 1);
            }
          });
        });

        const sorted = Array.from(tagMap.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 24);

        if (sorted.length > 0) setTags(sorted);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchPopularTags();
    return () => {
      cancelled = true;
    };
  }, [initialTags]);

  if (tags.length === 0) return null;

  return (
    <section
      className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 lg:px-8"
      aria-labelledby="popular-tags-heading"
    >
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <h2
              id="popular-tags-heading"
              className="text-base font-semibold text-balance text-foreground sm:text-lg"
            >
              Từ khóa &amp; Tags phổ biến
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Chạm vào từ khóa để lọc nhanh
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              to={`/tag/${encodeURIComponent(tag)}`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-button-hover hover:text-primary"
            >
              <span>#{tag}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
