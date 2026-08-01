import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  /** floating = circular overlay on top of a product thumbnail */
  variant?: 'floating' | 'inline';
}

export const WishlistButton = ({
  productId,
  className,
  variant = 'floating',
}: WishlistButtonProps) => {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);

  return (
    <button
      type="button"
      aria-label={saved ? 'Bỏ khỏi danh sách yêu thích' : 'Lưu vào danh sách yêu thích'}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 active:scale-90',
        variant === 'floating'
          ? 'absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-background/85 backdrop-blur-sm shadow-md hover:bg-background hover:scale-110'
          : 'h-11 w-11 rounded-lg border border-border hover:bg-muted',
        className
      )}
    >
      <Heart
        className={cn(
          'h-[18px] w-[18px] transition-colors',
          saved ? 'fill-destructive text-destructive' : 'text-muted-foreground'
        )}
      />
    </button>
  );
};
