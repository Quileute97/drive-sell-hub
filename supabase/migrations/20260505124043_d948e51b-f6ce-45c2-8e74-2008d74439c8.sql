
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, user_id, full_name, avatar_url, role, is_verified, created_at, total_sales
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;

CREATE POLICY "Authenticated users can create their own reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE OR REPLACE VIEW public.public_products
WITH (security_invoker = true) AS
SELECT
  id, seller_id, category_id, title, slug, description, short_description,
  price, original_price, preview_link, thumbnail_url, images, tags,
  file_size, file_format, download_count, view_count, rating_average,
  rating_count, status, is_featured, meta_title, meta_description,
  created_at, updated_at, download_only_link, read_only
FROM public.products;

GRANT SELECT ON public.public_products TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_product_download_link(_product_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _link text;
  _seller uuid;
  _price numeric;
BEGIN
  SELECT google_drive_link, seller_id, price INTO _link, _seller, _price
  FROM public.products WHERE id = _product_id;

  IF _link IS NULL THEN RETURN NULL; END IF;

  -- Free products: anyone can download
  IF _price = 0 THEN RETURN _link; END IF;

  IF auth.uid() = _seller OR public.has_role(auth.uid(), 'admin') THEN
    RETURN _link;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.orders
    WHERE product_id = _product_id
      AND buyer_id = auth.uid()
      AND status IN ('paid'::order_status, 'delivered'::order_status)
  ) THEN
    RETURN _link;
  END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_product_download_link(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;
