
-- 1) event_registrations: remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can view own registration by ticket" ON public.event_registrations;
DROP POLICY IF EXISTS "Anyone can register for events" ON public.event_registrations;

CREATE POLICY "Public can register for existing events"
  ON public.event_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_registrations.event_id)
  );

-- Secure ticket lookup (not exposed publicly by default)
CREATE OR REPLACE FUNCTION public.get_registration_by_ticket(_ticket text)
RETURNS TABLE(id uuid, event_id uuid, ticket_code text, status text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, event_id, ticket_code, status, created_at
  FROM public.event_registrations
  WHERE ticket_code = _ticket
$$;
REVOKE EXECUTE ON FUNCTION public.get_registration_by_ticket(text) FROM PUBLIC;

-- 2) profiles: use column-level SELECT privileges to protect PII from anon
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, user_id, company_name, segment, city, state, website, description,
  logo_url, plan, approved, created_at, updated_at, contact_phone, phone
) ON public.profiles TO anon;
-- authenticated keeps full SELECT via existing table grants
-- Fields NOT granted to anon: contact_name, contact_email, email, address, neighborhood, complement, reference_point, zip_code, cnpj

-- 3) company_contacts: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view contacts of approved companies" ON public.company_contacts;
CREATE POLICY "Authenticated users can view contacts of approved companies"
  ON public.company_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = company_contacts.user_id AND p.approved = true
    )
  );

-- 4) Storage: enforce per-user folder ownership on courses uploads
DROP POLICY IF EXISTS "Authenticated users can upload course files" ON storage.objects;
CREATE POLICY "Users can upload own course files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'courses'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 5) Restrict SECURITY DEFINER function execute privileges
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.increment_product_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.increment_product_contact(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_product_contact(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_product_contact(uuid) TO authenticated;
