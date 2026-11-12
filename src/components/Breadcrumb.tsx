import { Link } from "@/lib/router-compat";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string | undefined;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  // Prevent accidental duplicate "Trang chủ" entry if caller passes it
  const normalizedItems = items.filter(
    (item, idx) => !(idx === 0 && item.label.trim().toLowerCase() === "trang chủ")
  );

  const parentWithHref = [...normalizedItems]
    .reverse()
    .find((item) => Boolean(item.href));
  const mobileBackTarget = parentWithHref?.href || "/";
  const mobileBackLabel = parentWithHref?.label || "Trang chủ";

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-5", className)}>
      {/* Mobile: 1-tap touch-friendly parent back link (>=48px hit height) */}
      <Link
        to={mobileBackTarget}
        className="inline-flex min-h-12 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:hidden"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
        <span className="truncate max-w-[260px]">{mobileBackLabel}</span>
      </Link>

      {/* Desktop: full schema.org hierarchy */}
      <ol
        className="hidden flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:flex"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link
            to="/"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-1.5 transition-colors hover:text-foreground hover:underline"
            itemProp="item"
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            <span itemProp="name">Trang chủ</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {normalizedItems.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex min-w-0 items-center gap-1.5"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            {item.href ? (
              <Link
                to={item.href}
                className="inline-flex h-8 max-w-[240px] items-center truncate rounded-lg px-1.5 transition-colors hover:text-foreground hover:underline"
                itemProp="item"
              >
                <span itemProp="name" className="truncate">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span
                className="inline-flex h-8 max-w-[320px] items-center truncate px-1.5 font-medium text-foreground"
                itemProp="name"
                aria-current="page"
                title={item.label}
              >
                <span className="truncate">{item.label}</span>
              </span>
            )}
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  );
};
