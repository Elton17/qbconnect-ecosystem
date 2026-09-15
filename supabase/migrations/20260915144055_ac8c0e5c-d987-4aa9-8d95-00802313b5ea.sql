CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

DO $$
DECLARE policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual, '') LIKE '%has_role(%' OR coalesce(with_check, '') LIKE '%has_role(%')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I AS PERMISSIVE FOR %s TO %s%s%s',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename,
      policy_row.cmd,
      array_to_string(policy_row.roles, ', '),
      CASE WHEN policy_row.qual IS NOT NULL THEN ' USING (' || replace(policy_row.qual, 'has_role(', 'private.has_role(') || ')' ELSE '' END,
      CASE WHEN policy_row.with_check IS NOT NULL THEN ' WITH CHECK (' || replace(policy_row.with_check, 'has_role(', 'private.has_role(') || ')' ELSE '' END
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$ SELECT private.has_role(_user_id, _role) $$;

CREATE OR REPLACE FUNCTION private.increment_product_contact(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ UPDATE public.products SET contact_count = contact_count + 1 WHERE id = p_id AND active = true $$;

CREATE OR REPLACE FUNCTION private.increment_product_view(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ UPDATE public.products SET view_count = view_count + 1 WHERE id = p_id AND active = true $$;

GRANT EXECUTE ON FUNCTION private.increment_product_contact(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.increment_product_view(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.increment_product_contact(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private
AS $$ SELECT private.increment_product_contact(p_id) $$;

CREATE OR REPLACE FUNCTION public.increment_product_view(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private
AS $$ SELECT private.increment_product_view(p_id) $$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_product_contact(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_product_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_product_contact(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid) TO anon, authenticated, service_role;