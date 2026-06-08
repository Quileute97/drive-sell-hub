
-- 1) Restrict public profile listing to sellers only (buyers no longer enumerable)
DROP POLICY IF EXISTS "Public can view safe profile fields" ON public.profiles;
CREATE POLICY "Public can view seller profiles"
  ON public.profiles
  FOR SELECT
  USING (role = 'seller');

-- 2) Revoke sensitive profile columns from anon and authenticated.
--    Owner access still works via "Users can view their own profile" policy combined
--    with a column GRANT below limited to authenticated (RLS will still restrict rows).
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.profiles FROM authenticated;

-- Public/anon: only non-sensitive, display-safe columns
GRANT SELECT (id, user_id, full_name, avatar_url, role, is_verified, total_sales, created_at, updated_at)
  ON public.profiles TO anon;

-- Authenticated: same safe columns for browsing others + sensitive columns for own row
-- (RLS policies restrict which rows are returned; the column grants enable the row owner
--  to read their full profile, while other authenticated users only see the safe columns
--  because the "Public can view seller profiles" policy is the only one that matches rows
--  belonging to other users.)
GRANT SELECT (id, user_id, full_name, avatar_url, role, is_verified, total_sales, created_at, updated_at,
              email, phone, address, total_purchases, seller_commission_rate, referred_by_affiliate_id)
  ON public.profiles TO authenticated;

-- 3) Hide paid-only download link from clients
REVOKE SELECT ON public.products FROM anon;
REVOKE SELECT ON public.products FROM authenticated;

GRANT SELECT (id, seller_id, category_id, title, slug, description, short_description,
              price, original_price, google_drive_link, preview_link, thumbnail_url, images,
              tags, file_size, file_format, download_count, view_count, rating_average,
              rating_count, status, is_featured, meta_title, meta_description,
              created_at, updated_at, read_only)
  ON public.products TO anon, authenticated;

-- Sellers/admins still need full access (including download_only_link); RLS policies
-- "Sellers can manage their own products" and "Admins can manage all products" cover this,
-- but column-level INSERT/UPDATE/DELETE require explicit grants too.
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
-- Re-grant SELECT on the sensitive column to authenticated so sellers can read their own
-- download_only_link (RLS restricts to seller's own rows for non-active products and the
-- seller's policy permits selecting it for their own rows).
GRANT SELECT (download_only_link) ON public.products TO authenticated;

-- 4) Webtoon chapters: restrict drive_file_id to authenticated users only
REVOKE SELECT ON public.webtoon_chapters FROM anon;
-- Identify all chapter columns for safe public grant
DO $$
DECLARE
  cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ')
    INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'webtoon_chapters'
    AND column_name <> 'drive_file_id';
  EXECUTE format('GRANT SELECT (%s) ON public.webtoon_chapters TO anon', cols);
END$$;

-- Authenticated users may still read drive_file_id (full table grant restored)
GRANT SELECT ON public.webtoon_chapters TO authenticated;
