import { useState, useEffect, useMemo } from "react";
import { List, ChevronDown, ChevronUp, Hash, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  htmlContent: string;
  className?: string;
  title?: string;
  defaultOpen?: boolean;
}

export function slugify(text: string): string {
  if (!text) return "";
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug;
}

export function extractHeadings(html: string): TocItem[] {
  if (!html || typeof window === "undefined") return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3, h4");
    const items: TocItem[] = [];
    const usedIds = new Set<string>();

    headings.forEach((el, index) => {
      const text = el.textContent?.trim() || "";
      if (!text) return;
      let id = slugify(text) || `muc-${index + 1}`;
      if (usedIds.has(id)) {
        let i = 2;
        while (usedIds.has(`${id}-${i}`)) i++;
        id = `${id}-${i}`;
      }
      usedIds.add(id);
      items.push({ id, text, level: parseInt(el.tagName[1] ?? '2', 10) });
    });

    return items;
  } catch {
    return [];
  }
}

/** Inject id attributes into heading tags so anchor links work smoothly */
export function injectHeadingIds(html: string): string {
  if (!html || typeof window === "undefined") return html || "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3, h4");
    const usedIds = new Set<string>();

    headings.forEach((el, index) => {
      const text = el.textContent?.trim() || "";
      if (!text) return;
      let id = slugify(text) || `muc-${index + 1}`;
      if (usedIds.has(id)) {
        let i = 2;
        while (usedIds.has(`${id}-${i}`)) i++;
        id = `${id}-${i}`;
      }
      usedIds.add(id);
      el.setAttribute("id", id);
      el.classList.add("scroll-mt-24");
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

export function TableOfContents({
  htmlContent,
  className,
  title = "Mục lục bài viết",
  defaultOpen = true,
}: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo(() => extractHeadings(htmlContent), [htmlContent]);

  // Intersection observer to highlight active heading
  useEffect(() => {
    if (headings.length === 0 || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-90px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  return (
    <nav
      className={cn(
        "rounded-xl border bg-card/70 backdrop-blur-xs p-4 mb-6 shadow-xs transition-all",
        className
      )}
      aria-label="Mục lục bài viết"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base">
            {title} <span className="text-xs font-normal text-muted-foreground ml-1">({headings.length} mục)</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{isOpen ? "Thu gọn" : "Mở rộng"}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-border/60">
          <ol className="space-y-1.5 list-none max-h-[400px] overflow-y-auto pr-1">
            {headings.map((item, idx) => {
              const depth = Math.max(0, item.level - minLevel);
              const isH2OrH1 = item.level <= 2;
              return (
                <li
                  key={`${item.id}-${idx}`}
                  style={{ paddingLeft: `${depth * 14}px` }}
                  className="transition-all"
                >
                  <button
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={cn(
                      "flex items-start gap-1.5 w-full text-left py-1 px-2 rounded-md text-xs sm:text-sm transition-all cursor-pointer",
                      isH2OrH1 ? "font-medium" : "font-normal text-muted-foreground",
                      activeId === item.id
                        ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                        : "hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Hash className={cn("h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60", activeId === item.id && "text-primary opacity-100")} />
                    <span className="line-clamp-2">{item.text}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </nav>
  );
}
