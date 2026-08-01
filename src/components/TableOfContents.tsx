import { useState, useEffect, useMemo } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  htmlContent: string;
  className?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(html: string): TocItem[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h2, h3, h4");
  const items: TocItem[] = [];
  const usedIds = new Set<string>();

  headings.forEach((el) => {
    const text = el.textContent?.trim() || "";
    if (!text) return;
    let id = slugify(text);
    if (usedIds.has(id)) {
      let i = 2;
      while (usedIds.has(`${id}-${i}`)) i++;
      id = `${id}-${i}`;
    }
    usedIds.add(id);
    items.push({ id, text, level: parseInt(el.tagName[1] ?? '0') });
  });

  return items;
}

/** Inject id attributes into heading tags so anchor links work */
export function injectHeadingIds(html: string): string {
  if (!html) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h2, h3, h4");
  const usedIds = new Set<string>();

  headings.forEach((el) => {
    const text = el.textContent?.trim() || "";
    if (!text) return;
    let id = slugify(text);
    if (usedIds.has(id)) {
      let i = 2;
      while (usedIds.has(`${id}-${i}`)) i++;
      id = `${id}-${i}`;
    }
    usedIds.add(id);
    el.setAttribute("id", id);
  });

  return doc.body.innerHTML;
}

export function TableOfContents({ htmlContent, className }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo(() => extractHeadings(htmlContent), [htmlContent]);

  // Intersection observer to highlight active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav
      className={cn(
        "rounded-lg border bg-card p-4 mb-6",
        className
      )}
      aria-label="Mục lục"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <List className="h-4 w-4 text-primary" />
          Mục lục ({headings.length} mục)
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <ol className="mt-3 space-y-1 list-none">
          {headings.map((item) => (
            <li
              key={item.id}
              style={{ paddingLeft: `${(item.level - minLevel) * 16}px` }}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(item.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActiveId(item.id);
                  }
                }}
                className={cn(
                  "block py-1 text-sm border-l-2 pl-3 transition-colors hover:text-primary hover:border-primary",
                  activeId === item.id
                    ? "text-primary border-primary font-medium"
                    : "text-muted-foreground border-transparent"
                )}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
