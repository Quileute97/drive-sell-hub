
-- 1) PRODUCTS: hide download_only_link entirely from public/auth column grants.
REVOKE SELECT (download_only_link) ON public.products FROM authenticated;
-- (anon was already revoked previously)

CREATE OR REPLACE FUNCTION public.get_seller_download_only_link(_product_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _link text;
  _seller uuid;
BEGIN
  SELECT download_only_link, seller_id INTO _link, _seller
  FROM public.products WHERE id = _product_id;
  IF _link IS NULL THEN RETURN NULL; END IF;
  IF auth.uid() = _seller OR public.has_role(auth.uid(), 'admin') THEN
    RETURN _link;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.get_seller_download_only_link(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_seller_download_only_link(uuid) TO authenticated;

-- 2) PROFILES: remove sensitive columns from authenticated grant; provide owner RPC.
REVOKE SELECT (email, phone, address, total_purchases, seller_commission_rate, referred_by_affiliate_id)
  ON public.profiles FROM authenticated;

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_my_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- 3) ORDERS: restrict seller UPDATE to the `status` column only and add WITH CHECK.
DROP POLICY IF EXISTS "Sellers can update their orders" ON public.orders;
CREATE POLICY "Sellers can update their orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Column-level UPDATE: sellers/admins can only modify `status` directly.
-- (Admin still has the "Admins can manage all orders" ALL policy; admin updates also limited
--  to `status` from the client. Service role / edge functions bypass column grants.)
REVOKE UPDATE ON public.orders FROM authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;

-- 4) SELLER_FOLLOWERS: revoke follower_id from anon (counts and seller_id still readable).
REVOKE SELECT ON public.seller_followers FROM anon;
GRANT SELECT (id, seller_id, created_at) ON public.seller_followers TO anon;
-- authenticated keeps full SELECT so users can check their own follow status.
GRANT SELECT ON public.seller_followers TO authenticated;

-- 5) WEBTOON_CHAPTERS: replace blanket policy with role-scoped policies; anon col grants already exclude drive_file_id.
DROP POLICY IF EXISTS "Chapters viewable by all" ON public.webtoon_chapters;
CREATE POLICY "Public can view chapter metadata"
  ON public.webtoon_chapters
  FOR SELECT
  TO anon, authenticated
  USING (true);
