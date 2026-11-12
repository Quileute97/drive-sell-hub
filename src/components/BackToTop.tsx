import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 240);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      className={cn(
        "fixed bottom-24 right-4 sm:right-6 z-30 inline-flex size-12 md:size-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-surface text-foreground shadow-[var(--shadow-popover)] outline-hidden transition-colors hover:bg-button-hover active:scale-95 animate-pop-in",
        className
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

