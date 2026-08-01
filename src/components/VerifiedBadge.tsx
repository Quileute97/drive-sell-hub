import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  verified?: boolean | null;
  /** icon = chỉ icon nhỏ cạnh tên, full = badge có chữ */
  variant?: 'icon' | 'full';
  className?: string;
}

export const VerifiedBadge = ({
  verified,
  variant = 'icon',
  className,
}: VerifiedBadgeProps) => {
  if (!verified) return null;

  const label = 'Người bán đã xác minh bởi Salemylink';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          aria-label={label}
          className={cn(
            'inline-flex items-center gap-1 align-middle',
            variant === 'full' &&
              'rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary',
            className
          )}
        >
          <BadgeCheck
            className={cn(
              'shrink-0 text-primary',
              variant === 'full' ? 'h-3.5 w-3.5' : 'h-4 w-4'
            )}
          />
          {variant === 'full' && <span>Đã xác minh</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};
