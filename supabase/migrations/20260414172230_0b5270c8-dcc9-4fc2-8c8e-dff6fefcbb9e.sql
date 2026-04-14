
-- Make user_id nullable to allow anonymous registrations
ALTER TABLE public.event_registrations ALTER COLUMN user_id DROP NOT NULL;

-- Allow anonymous inserts (anyone can register for events)
CREATE POLICY "Anyone can register for events"
ON public.event_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to view registrations by ticket_code (for confirmation page)
CREATE POLICY "Anyone can view own registration by ticket"
ON public.event_registrations
FOR SELECT
TO anon, authenticated
USING (true);
