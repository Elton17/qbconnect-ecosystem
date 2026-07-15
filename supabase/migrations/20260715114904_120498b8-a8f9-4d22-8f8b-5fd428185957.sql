
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS forwarded_at TIMESTAMPTZ;

CREATE POLICY "Admins can update waitlist entries"
  ON public.waitlist FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
