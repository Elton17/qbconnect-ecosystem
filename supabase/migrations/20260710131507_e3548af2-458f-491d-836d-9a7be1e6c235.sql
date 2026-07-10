
DROP POLICY IF EXISTS "Anyone can submit to waitlist" ON public.waitlist;
CREATE POLICY "Anyone can submit to waitlist"
  ON public.waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    company_name IS NOT NULL AND length(trim(company_name)) > 0
    AND whatsapp IS NOT NULL AND length(trim(whatsapp)) > 0
  );
