import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_PRICE_SLIDER, PRICE_STEP, formatMoneyVnd } from "@/lib/productQuery";
import { cn } from "@/lib/utils";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  disabled?: boolean;
  className?: string;
}

function clampPrice(val: number): number {
  return Math.min(MAX_PRICE_SLIDER, Math.max(0, Math.round(val / PRICE_STEP) * PRICE_STEP));
}

function formatInputVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function parseInputVnd(raw: string, fallback: number): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return fallback;
  const num = parseInt(digits, 10);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(MAX_PRICE_SLIDER, Math.max(0, num));
}

export function PriceRangeSlider({
  min,
  max,
  onChange,
  disabled = false,
  className,
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [draggingThumb, setDraggingThumb] = useState<"min" | "max" | null>(null);
  const [draftMin, setDraftMin] = useState(() => formatInputVnd(min));
  const [draftMax, setDraftMax] = useState(() => formatInputVnd(max));

  useEffect(() => {
    setDraftMin(formatInputVnd(min));
  }, [min]);

  useEffect(() => {
    setDraftMax(formatInputVnd(max));
  }, [max]);

  const minPct = Math.round((min / MAX_PRICE_SLIDER) * 100);
  const maxPct = Math.round((max / MAX_PRICE_SLIDER) * 100);

  const clientXToPrice = useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return clampPrice(ratio * MAX_PRICE_SLIDER);
  }, []);

  const updateFromClientX = useCallback(
    (clientX: number, thumb: "min" | "max") => {
      const nextVal = clientXToPrice(clientX);
      if (thumb === "min") {
        onChange(Math.min(nextVal, max), max);
      } else {
        onChange(min, Math.max(nextVal, min));
      }
    },
    [clientXToPrice, max, min, onChange]
  );

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if ((e.target as HTMLElement).dataset["rangeThumb"]) return;
    const val = clientXToPrice(e.clientX);
    const distMin = Math.abs(val - min);
    const distMax = Math.abs(val - max);
    if (distMin <= distMax) {
      onChange(Math.min(val, max), max);
    } else {
      onChange(min, Math.max(val, min));
    }
  };

  const handleThumbKeyDown = (thumb: "min" | "max") => (e: React.KeyboardEvent) => {
    if (disabled) return;
    let delta = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -PRICE_STEP;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = PRICE_STEP;
    else if (e.key === "Home") {
      e.preventDefault();
      if (thumb === "min") onChange(0, max);
      else onChange(min, min);
      return;
    } else if (e.key === "End") {
      e.preventDefault();
      if (thumb === "min") onChange(max, max);
      else onChange(min, MAX_PRICE_SLIDER);
      return;
    } else {
      return;
    }
    e.preventDefault();
    if (thumb === "min") {
      const next = Math.min(max, Math.max(0, min + delta));
      onChange(next, max);
    } else {
      const next = Math.max(min, Math.min(MAX_PRICE_SLIDER, max + delta));
      onChange(min, next);
    }
  };

  const commitMinDraft = () => {
    const parsed = parseInputVnd(draftMin, min);
    const clamped = Math.min(parsed, max);
    setDraftMin(formatInputVnd(clamped));
    if (clamped !== min) onChange(clamped, max);
  };

  const commitMaxDraft = () => {
    const parsed = parseInputVnd(draftMax, max);
    const clamped = Math.max(parsed, min);
    setDraftMax(formatInputVnd(clamped));
    if (clamped !== max) onChange(min, clamped);
  };

  return (
    <div className={cn("space-y-3", disabled && "opacity-55 pointer-events-none", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Khoảng giá
        </span>
        <span className="text-xs font-medium text-foreground tabular-nums">
          {min === 0 ? "0 đ" : formatMoneyVnd(min)} – {formatMoneyVnd(max)}
        </span>
      </div>

      <div className="px-3.5">
        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          className="relative flex h-6 cursor-pointer items-center select-none touch-none"
        >
          <div className="h-1.5 w-full rounded-full bg-[var(--border-strong)]" />
          <div
            className="absolute h-1.5 rounded-full bg-primary"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />

          <button
            type="button"
            role="slider"
            aria-label="Giá tối thiểu"
            aria-valuemin={0}
            aria-valuemax={MAX_PRICE_SLIDER}
            aria-valuenow={min}
            data-range-thumb="min"
            disabled={disabled}
            onPointerDown={(e) => {
              if (disabled) return;
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setDraggingThumb("min");
            }}
            onPointerMove={(e) => {
              if (draggingThumb === "min") updateFromClientX(e.clientX, "min");
            }}
            onPointerUp={() => setDraggingThumb(null)}
            onPointerCancel={() => setDraggingThumb(null)}
            onKeyDown={handleThumbKeyDown("min")}
            className="absolute size-5 -translate-x-1/2 cursor-grab rounded-full border-2 border-primary bg-surface shadow-xs active:cursor-grabbing before:absolute before:-inset-3.5 outline-hidden"
            style={{ left: `${minPct}%`, zIndex: draggingThumb === "min" ? 20 : 10 }}
          />

          <button
            type="button"
            role="slider"
            aria-label="Giá tối đa"
            aria-valuemin={0}
            aria-valuemax={MAX_PRICE_SLIDER}
            aria-valuenow={max}
            data-range-thumb="max"
            disabled={disabled}
            onPointerDown={(e) => {
              if (disabled) return;
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setDraggingThumb("max");
            }}
            onPointerMove={(e) => {
              if (draggingThumb === "max") updateFromClientX(e.clientX, "max");
            }}
            onPointerUp={() => setDraggingThumb(null)}
            onPointerCancel={() => setDraggingThumb(null)}
            onKeyDown={handleThumbKeyDown("max")}
            className="absolute size-5 -translate-x-1/2 cursor-grab rounded-full border-2 border-primary bg-surface shadow-xs active:cursor-grabbing before:absolute before:-inset-3.5 outline-hidden"
            style={{ left: `${maxPct}%`, zIndex: draggingThumb === "max" ? 20 : 10 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Từ (đ)</span>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Giá tối thiểu"
            disabled={disabled}
            value={draftMin}
            onChange={(e) => setDraftMin(e.target.value)}
            onBlur={commitMinDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitMinDraft();
              }
            }}
            className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-surface px-3 text-sm text-foreground tabular-nums outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Đến (đ)</span>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Giá tối đa"
            disabled={disabled}
            value={draftMax}
            onChange={(e) => setDraftMax(e.target.value)}
            onBlur={commitMaxDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitMaxDraft();
              }
            }}
            className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-surface px-3 text-sm text-foreground tabular-nums outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </div>
    </div>
  );
}

