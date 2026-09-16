CREATE OR REPLACE FUNCTION private.profile_approval_is_unchanged(_profile_id uuid, _approved boolean)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = _profile_id
      AND p.approved IS NOT DISTINCT FROM _approved
  );
$$;

REVOKE ALL ON FUNCTION private.profile_approval_is_unchanged(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.profile_approval_is_unchanged(uuid, boolean) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND private.profile_approval_is_unchanged(id, approved)
);