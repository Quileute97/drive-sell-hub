import { BookOpen } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReadOnlyButtonProps extends Omit<ButtonProps, "onClick"> {
  previewUrl: string | null;
  onMissingUrl?: () => void;
  onClick?: ButtonProps["onClick"];
}

export const ReadOnlyButton = ({
  previewUrl,
  onMissingUrl,
  onClick,
  className,
  ...props
}: ReadOnlyButtonProps) => {
  const handleClick: NonNullable<ButtonProps["onClick"]> = (event) => {
    event.stopPropagation();
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (!previewUrl) {
      onMissingUrl?.();
      return;
    }

    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      {...props}
      variant="outline"
      className={cn("w-full", className)}
      onClick={handleClick}
    >
      <BookOpen className="h-4 w-4" />
      Đọc trực tuyến
    </Button>
  );
};
