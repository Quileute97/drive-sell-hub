-- Allow users to insert their own seller role
CREATE POLICY "Users can register as seller"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'seller'
);