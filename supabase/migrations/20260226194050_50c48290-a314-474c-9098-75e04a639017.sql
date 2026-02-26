-- Drop restrictive policy and recreate as permissive for public access
DROP POLICY IF EXISTS "Approved profiles are publicly viewable" ON public.profiles;

CREATE POLICY "Approved profiles are publicly viewable"
  ON public.profiles
  FOR SELECT
  USING (approved = true);

-- Allow admins to view ALL profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile (approve/reject)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));