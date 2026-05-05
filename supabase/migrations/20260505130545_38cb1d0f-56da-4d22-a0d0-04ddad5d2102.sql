
-- ============ PROFILES ============
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Owner full access
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Restrict column-level access for anon/authenticated to safe fields only
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, user_id, full_name, avatar_url, role, is_verified, created_at, total_sales)
  ON public.profiles TO anon, authenticated;
GRANT UPDATE, INSERT ON public.profiles TO authenticated;

-- Public read policy limited to safe columns (column grants enforce which columns can be returned)
CREATE POLICY "Public can view safe profile fields"
ON public.profiles FOR SELECT
USING (true);

-- ============ PAYMENTS ============
DROP POLICY IF EXISTS "System can manage payments" ON public.payments;

CREATE POLICY "Admins can manage payments"
ON public.payments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- "Users can view their order payments" SELECT policy already exists and remains.

-- ============ ANALYTICS ============
DROP POLICY IF EXISTS "Analytics are managed by system" ON public.analytics;

CREATE POLICY "Anyone can insert analytics"
ON public.analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
ON public.analytics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage analytics"
ON public.analytics FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ PRODUCTS - hide download link columns from public SELECT ============
REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT (
  id, seller_id, category_id, title, slug, description, short_description,
  price, original_price, preview_link, read_only,
  thumbnail_url, images, tags, file_size, file_format,
  download_count, view_count, rating_average, rating_count,
  status, is_featured, meta_title, meta_description,
  created_at, updated_at
) ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
