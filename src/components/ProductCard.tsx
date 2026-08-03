import { Link, useNavigate } from '@/lib/router-compat';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Download, Eye, ShoppingCart, BookOpen } from 'lucide-react';
import { ProductThumbnail } from '@/components/ProductThumbnail';
import { FreeDownloadButton } from '@/components/FreeDownloadButton';
import { WishlistButton } from '@/components/WishlistButton';
import { useCart } from '@/hooks/useCart';
import { getProductDownloadUrl, isFreeProduct } from '@/lib/productAccess';

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  description?: string | null;
  price: number;
  original_price?: number | null;
  thumbnail_url?: string | null;
  google_drive_link: string;
  download_only_link?: string | null;
  read_only?: boolean | null;
  download_count?: number | null;
  view_count?: number | null;
  rating_average?: number | null;
  rating_count?: number | null;
  file_format?: string | null;
  file_size?: string | null;
  categories?: { name: string; slug: string } | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const ProductCard = ({
  product,
  loading = 'lazy',
}: {
  product: ProductCardData;
  loading?: 'lazy' | 'eager';
}) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const isFree = isFreeProduct(product.price);
  const downloadUrl = getProductDownloadUrl(
    product.google_drive_link,
    product.download_only_link
  );
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  return (
    <article className="group flex h-full flex-col">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          <Link to={`/product/${product.slug}`} className="block h-full w-full">
            <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
              <ProductThumbnail
                googleDriveLink={product.google_drive_link}
                thumbnailUrl={product.thumbnail_url ?? null}
                fileFormat={product.file_format ?? ''}
                title={product.title}
                size={600}
                loading={loading}
              />
            </div>
          </Link>
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground shadow-md">
              -{discount}%
            </Badge>
          )}
          <WishlistButton productId={product.id} />
        </div>

        <CardContent className="flex grow flex-col p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {product.categories && (
              <Link to={`/category/${product.categories.slug}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {product.categories.name}
                </Badge>
              </Link>
            )}
            {product.file_format && (
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 text-xs font-medium text-primary"
              >
                {product.file_format.toUpperCase()}
              </Badge>
            )}
          </div>

          <Link to={`/product/${product.slug}`}>
            <h3 className="mb-2 line-clamp-2 min-h-[3rem] text-base font-semibold transition-colors group-hover:text-primary">
              {product.title}
            </h3>
          </Link>

          <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
            {product.short_description || product.description}
          </p>

          {(product.rating_count ?? 0) > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.floor(product.rating_average || 0)
                        ? 'h-3.5 w-3.5 fill-yellow-400 text-yellow-400'
                        : 'h-3.5 w-3.5 text-muted-foreground/40'
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.rating_count})</span>
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {(product.download_count ?? 0) > 0 && (
              <span className="flex items-center">
                <Download className="mr-1 h-3.5 w-3.5" />
                {product.download_count}
              </span>
            )}
            {(product.view_count ?? 0) > 0 && (
              <span className="flex items-center">
                <Eye className="mr-1 h-3.5 w-3.5" />
                {product.view_count}
              </span>
            )}
            {product.file_size && <span>📄 {product.file_size}</span>}
          </div>

          <div className="mt-auto flex items-baseline gap-2">
            <div className="text-lg font-bold text-primary">
              {isFree ? 'Miễn phí' : formatPrice(product.price)}
            </div>
            {discount > 0 && product.original_price && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {product.read_only ? (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => navigate(`/read/${product.slug}`)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Đọc trực tuyến (Full màn hình)
            </Button>
          ) : isFree ? (
            <FreeDownloadButton size="sm" downloadUrl={downloadUrl} />
          ) : (
            <Button size="sm" className="w-full" onClick={() => addToCart(product.id)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ
            </Button>
          )}
        </CardFooter>
      </Card>
    </article>
  );
};
