import React from "react";
import { Link } from "@/lib/router-compat";

interface LogoProps {
  /** Size variant or custom dimension in px */
  size?: "sm" | "md" | "lg" | "xl" | number;
  /** Whether to render full logo (mark + text) or icon mark only */
  variant?: "full" | "mark" | "text";
  /** Tagline visibility under brand text (e.g. DIGITAL MARKETPLACE) */
  showTagline?: boolean;
  /** Force specific color theme */
  theme?: "auto" | "light" | "dark";
  /** Optional link destination (default '/') or null to disable link */
  href?: string | null;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Modern Vector Logo Mark for Salemylink.com
 * Represents interlocking 'S-Link' (Sale + Digital Link / Instant Delivery)
 */
export const LogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = "",
}) => {
  return (
    <img
      src="/logo.png"
      alt="Salemylink Logo"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`shrink-0 rounded-xl shadow-md object-contain ${className}`}
      loading="eager"
    />
  );
};

/**
 * Standard Salemylink Brand Logo Component
 */
export const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "full",
  showTagline = false,
  theme = "auto",
  href = "/",
  className = "",
}) => {
  const sizeMap = {
    sm: { markSize: 26, fontSize: "text-lg", dotSize: "text-xs", tagSize: "text-[8px]" },
    md: { markSize: 34, fontSize: "text-xl", dotSize: "text-sm", tagSize: "text-[9px]" },
    lg: { markSize: 44, fontSize: "text-2xl", dotSize: "text-base", tagSize: "text-[10px]" },
    xl: { markSize: 56, fontSize: "text-3xl", dotSize: "text-lg", tagSize: "text-xs" },
  };

  const currentSize =
    typeof size === "string"
      ? sizeMap[size] || sizeMap.md
      : {
          markSize: size,
          fontSize: "text-xl",
          dotSize: "text-sm",
          tagSize: "text-[9px]",
        };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark */}
      {variant !== "text" && (
        <div className="transition-transform duration-200 hover:scale-105">
          <LogoMark size={currentSize.markSize} />
        </div>
      )}

      {/* Typography */}
      {variant !== "mark" && (
        <div className="flex flex-col">
          <div
            className={`font-black tracking-tight leading-none ${currentSize.fontSize} font-sans`}
          >
            <span
              className={
                theme === "dark"
                  ? "text-white"
                  : theme === "light"
                  ? "text-slate-900"
                  : "text-foreground"
              }
            >
              Sale
            </span>
            <span className="text-sky-500">my</span>
            <span className="text-orange-500">link</span>
            <span
              className={`font-bold ${currentSize.dotSize} ${
                theme === "dark"
                  ? "text-slate-400"
                  : theme === "light"
                  ? "text-slate-500"
                  : "text-muted-foreground"
              }`}
            >
              .com
            </span>
          </div>

          {showTagline && (
            <span
              className={`font-bold uppercase tracking-widest leading-none mt-1 ${
                currentSize.tagSize
              } ${
                theme === "dark"
                  ? "text-slate-400"
                  : theme === "light"
                  ? "text-slate-500"
                  : "text-muted-foreground"
              }`}
            >
              Digital Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="inline-flex items-center hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        aria-label="Salemylink.com Trang chủ"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
