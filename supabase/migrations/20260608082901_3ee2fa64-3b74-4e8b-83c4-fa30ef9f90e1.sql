
-- 1. Orders: restrict SELECT policy to buyers only (admins keep ALL access).
--    Sellers will read their orders via a SECURITY DEFINER RPC that omits buyer_email.
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Buyers can view their orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

-- RPC returning seller-safe order columns (no buyer_email)
CREATE OR REPLACE FUNCTION public.get_seller_orders()
RETURNS TABLE(
  id uuid,
  buyer_id uuid,
  seller_id uuid,
  product_id uuid,
  order_number text,
  quantity integer,
  unit_price numeric,
  total_amount numeric,
  commission_rate numeric,
  commission_amount numeric,
  seller_amount numeric,
  status order_status,
  download_link text,
  download_expires_at timestamptz,
  download_count integer,
  max_downloads integer,
  buyer_name text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  affiliate_id uuid,
  seller_referrer_affiliate_id uuid,
  product_title text,
  product_price numeric,
  product_thumbnail text,
  product_slug text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.id, o.buyer_id, o.seller_id, o.product_id, o.order_number, o.quantity,
    o.unit_price, o.total_amount, o.commission_rate, o.commission_amount, o.seller_amount,
    o.status, o.download_link, o.download_expires_at, o.download_count, o.max_downloads,
    o.buyer_name, o.notes, o.created_at, o.updated_at, o.affiliate_id, o.seller_referrer_affiliate_id,
    p.title, p.price, p.thumbnail_url, p.slug
  FROM public.orders o
  LEFT JOIN public.products p ON p.id = o.product_id
  WHERE o.seller_id = auth.uid()
  ORDER BY o.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.get_seller_orders() TO authenticated;

-- Lightweight RPC for balance calculations (seller_amount + status only)
CREATE OR REPLACE FUNCTION public.get_seller_order_amounts()
RETURNS TABLE(seller_amount numeric, status order_status)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT seller_amount, status FROM public.orders WHERE seller_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_seller_order_amounts() TO authenticated;

-- 2. Reviews: hide buyer_id from anonymous viewers (authenticated owners still see it)
REVOKE SELECT (buyer_id) ON public.reviews FROM anon;

-- 3. Seller followers: hide follower_id from authenticated users too
--    (anon already lacks this column; only id/seller_id/created_at remain readable)
REVOKE SELECT (follower_id) ON public.seller_followers FROM authenticated;

-- 4. Analytics: prevent spoofed attribution
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON public.analytics;
CREATE POLICY "Users can insert their own analytics"
  ON public.analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
