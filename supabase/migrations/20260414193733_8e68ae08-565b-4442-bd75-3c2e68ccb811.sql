
-- Create waitlist table for pre-launch lead capture
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form, no auth required)
CREATE POLICY "Anyone can submit to waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view waitlist entries
CREATE POLICY "Admins can view all waitlist entries"
ON public.waitlist
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete waitlist entries
CREATE POLICY "Admins can delete waitlist entries"
ON public.waitlist
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
