-- Update RLS policy to allow anyone to insert reviews (including anonymous users)
-- First, drop the existing insert policy
DROP POLICY IF EXISTS "Users can create reviews for their purchases" ON public.reviews;

-- Create new policy allowing anyone to insert reviews
-- For anonymous users, we'll need to handle buyer_id differently
CREATE POLICY "Anyone can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Also update the select policy to show all approved reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "Approved reviews are viewable by everyone"
ON public.reviews
FOR SELECT
USING (is_approved = true);

-- Update the update policy to allow users to edit their own reviews
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = buyer_id);