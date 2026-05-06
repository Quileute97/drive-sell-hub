-- Restore full SELECT on products to anon/authenticated.
-- The previous column-level GRANT broke `select('*')` queries (permission denied for table products).
-- Download link protection is enforced via get_product_download_link() SECURITY DEFINER function,
-- not via column hiding (the app also needs google_drive_link to render Google Drive thumbnails).

GRANT SELECT ON public.products TO anon, authenticated;