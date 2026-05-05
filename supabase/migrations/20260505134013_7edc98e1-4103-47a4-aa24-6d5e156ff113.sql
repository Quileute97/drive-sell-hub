
-- Restrict analytics inserts to authenticated users only (was WITH CHECK true)
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics;

CREATE POLICY "Authenticated users can insert analytics"
ON public.analytics FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
