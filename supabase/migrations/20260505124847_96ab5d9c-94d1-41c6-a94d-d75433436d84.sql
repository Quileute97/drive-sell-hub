
-- PROFILES: restore public read but only for safe columns to anon
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Public profiles are viewable"
  ON public.profiles FOR SELECT
  USING (true);

-- Anonymous visitors only get safe columns
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, user_id, full_name, avatar_url, role, is_verified, created_at, total_sales)
  ON public.profiles TO anon;

-- Authenticated users keep full SELECT (RLS still gates rows; PostgREST embeds work)
GRANT SELECT ON public.profiles TO authenticated;

-- PRODUCTS: hide google_drive_link from anonymous visitors
REVOKE SELECT (google_drive_link) ON public.products FROM anon;
