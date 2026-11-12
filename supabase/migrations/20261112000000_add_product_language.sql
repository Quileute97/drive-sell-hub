-- Add language column to products for server-side multilingual filtering (vi, en, zh, es)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'vi';

CREATE INDEX IF NOT EXISTS idx_products_language ON public.products (language);

-- Expose language on public_products view as well
CREATE OR REPLACE VIEW public.public_products
WITH (security_invoker = true) AS
SELECT
  id, seller_id, category_id, title, slug, description, short_description,
  price, original_price, preview_link, thumbnail_url, images, tags,
  file_size, file_format, download_count, view_count, rating_average,
  rating_count, status, is_featured, meta_title, meta_description,
  created_at, updated_at, download_only_link, read_only, language
FROM public.products;

GRANT SELECT ON public.public_products TO anon, authenticated;

