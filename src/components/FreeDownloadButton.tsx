import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FreeDownloadButtonProps extends Omit<ButtonProps, "onClick"> {
  downloadUrl: string | null;
  countdownSeconds?: number;
  onMissingUrl?: () => void;
  onClick?: ButtonProps["onClick"];
}

export const FreeDownloadButton = ({
  downloadUrl,
  countdownSeconds = 60,
  onMissingUrl,
  onClick,
  className,
  disabled,
  ...props
}: FreeDownloadButtonProps) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const isCounting = secondsLeft !== null && secondsLeft > 0;
  const isUnlocked = secondsLeft === 0;

  useEffect(() => {
    if (!isCounting) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current === null || current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isCounting]);

  const progressValue = useMemo(() => {
    if (secondsLeft === null) return 0;
    return ((countdownSeconds - secondsLeft) / countdownSeconds) * 100;
  }, [countdownSeconds, secondsLeft]);

  const buttonLabel = isCounting
    ? `Vui lòng chờ ${secondsLeft}s`
    : isUnlocked
      ? "Tải tài liệu ngay"
      : `Tải miễn phí sau ${countdownSeconds}s`;

  const handleClick: NonNullable<ButtonProps["onClick"]> = (event) => {
    onClick?.(event);

    if (event.defaultPrevented) return;

    if (!downloadUrl) {
      onMissingUrl?.();
      return;
    }

    if (!isUnlocked) {
      if (!isCounting) {
        setSecondsLeft(countdownSeconds);
      }
      return;
    }

    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full space-y-2">
      <Button
        {...props}
        className={cn("w-full", className)}
        disabled={disabled || isCounting}
        onClick={handleClick}
      >
        <Download className="h-4 w-4" />
        {buttonLabel}
      </Button>

      {secondsLeft !== null && (
        <div className="space-y-1">
          <Progress value={progressValue} className="h-2" aria-hidden="true" />
          <p className="text-center text-xs text-muted-foreground">
            {isUnlocked
              ? "Đã sẵn sàng tải xuống."
              : "Hết 60 giây, bấm lại để mở link tải."}
          </p>
        </div>
      )}
    </div>
  );
};