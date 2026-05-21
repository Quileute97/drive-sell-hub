import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tags, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  categoryId?: string | null;
  title?: string;
  maxSuggestions?: number;
}

export function TagInput({ value, onChange, categoryId, title, maxSuggestions = 20 }: TagInputProps) {
  const [current, setCurrent] = useState("");
  const [allTags, setAllTags] = useState<{ tag: string; count: number; sameCategory: boolean }[]>([]);

  useEffect(() => {
    (async () => {
      const tagMap = new Map<string, { count: number; sameCategory: boolean }>();

      const ingest = (rows: any[] | null, sameCategory: boolean) => {
        (rows || []).forEach((r) => {
          (r.tags || []).forEach((t: string) => {
            const n = (t || "").trim();
            if (!n) return;
            const existing = tagMap.get(n);
            if (existing) {
              existing.count += 1;
              if (sameCategory) existing.sameCategory = true;
            } else {
              tagMap.set(n, { count: 1, sameCategory });
            }
          });
        });
      };

      if (categoryId) {
        const { data } = await supabase
          .from("products")
          .select("tags")
          .eq("status", "active")
          .eq("category_id", categoryId)
          .not("tags", "is", null)
          .limit(500);
        ingest(data, true);
      }

      const { data: all } = await supabase
        .from("products")
        .select("tags")
        .eq("status", "active")
        .not("tags", "is", null)
        .limit(500);
      ingest(all, false);

      const arr = Array.from(tagMap.entries())
        .map(([tag, v]) => ({ tag, ...v }))
        .sort((a, b) => (Number(b.sameCategory) - Number(a.sameCategory)) || b.count - a.count);
      setAllTags(arr);
    })();
  }, [categoryId]);

  const titleWords = useMemo(
    () =>
      (title || "")
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 3),
    [title]
  );

  const suggestions = useMemo(() => {
    const q = current.trim().toLowerCase();
    const pool = allTags.filter((t) => !value.includes(t.tag));
    if (q) {
      return pool.filter((t) => t.tag.toLowerCase().includes(q)).slice(0, maxSuggestions);
    }
    // Smart: match title words first, then top popular
    const matchedByTitle = pool.filter((t) =>
      titleWords.some((w) => t.tag.toLowerCase().includes(w))
    );
    const rest = pool.filter((t) => !matchedByTitle.includes(t));
    return [...matchedByTitle, ...rest].slice(0, maxSuggestions);
  }, [allTags, current, value, titleWords, maxSuggestions]);

  const addTag = (tag?: string) => {
    const t = (tag ?? current).trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setCurrent("");
  };

  const removeTag = (t: string) => onChange(value.filter((x) => x !== t));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Nhập tag hoặc chọn gợi ý bên dưới"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => addTag()}>
          <Tags className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="rounded-md border border-dashed p-3 bg-muted/30">
          <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Gợi ý {categoryId ? "theo danh mục" : "phổ biến"} — bấm để thêm</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <Badge
                key={s.tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => addTag(s.tag)}
              >
                {s.tag}
                <span className="ml-1 text-[10px] opacity-60">({s.count})</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
