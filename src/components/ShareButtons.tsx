import { Check, Copy, Send, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
  compact?: boolean;
  className?: string;
}

export function ShareButtons({ url, title, compact = false, className }: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const zaloHref = `https://zalo.me/share?u=${encodedUrl}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const telegramHref = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Đã sao chép liên kết",
        description: "Link sản phẩm đã được lưu vào clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Không thể sao chép",
        description: "Vui lòng copy thủ công từ thanh địa chỉ.",
        variant: "destructive",
      });
    }
  };

  const pillCls =
    "inline-flex min-h-11 sm:min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-button-hover";

  return (
    <div
      className={cn(
        compact ? "flex flex-wrap items-center gap-2" : "grid grid-cols-2 gap-2",
        className
      )}
    >
      <a
        href={zaloHref}
        target="_blank"
        rel="noopener noreferrer"
        className={pillCls}
        aria-label="Chia sẻ qua Zalo"
        title="Chia sẻ qua Zalo"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-4 items-center justify-center rounded-sm bg-[#0068ff] text-xs font-bold leading-none text-white"
        >
          Z
        </span>
        {!compact && <span>Zalo</span>}
      </a>

      <a
        href={fbHref}
        target="_blank"
        rel="noopener noreferrer"
        className={pillCls}
        aria-label="Chia sẻ lên Facebook"
        title="Chia sẻ lên Facebook"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-4 items-center justify-center rounded-sm bg-[#1453c6] text-xs font-bold leading-none text-white"
        >
          f
        </span>
        {!compact && <span>Facebook</span>}
      </a>

      <a
        href={telegramHref}
        target="_blank"
        rel="noopener noreferrer"
        className={pillCls}
        aria-label="Chia sẻ qua Telegram"
        title="Chia sẻ qua Telegram"
      >
        <Send className="h-3.5 w-3.5 text-[#229ed9]" />
        {!compact && <span>Telegram</span>}
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className={pillCls}
        aria-label="Sao chép liên kết sản phẩm"
        title="Sao chép link"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-[var(--status-success)]" />
            <span>Đã chép</span>
          </>
        ) : (
          <>
            {compact ? <Share2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Sao chép link</span>
          </>
        )}
      </button>
    </div>
  );
}

