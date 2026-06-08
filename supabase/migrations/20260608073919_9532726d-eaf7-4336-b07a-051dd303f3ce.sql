DROP POLICY IF EXISTS "Anyone can log click" ON public.affiliate_clicks;
REVOKE INSERT ON public.affiliate_clicks FROM anon, authenticated;