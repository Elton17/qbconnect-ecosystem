
-- Add registration_fields config to events (which fields to collect)
ALTER TABLE public.events ADD COLUMN registration_fields jsonb DEFAULT '["nome"]'::jsonb;

-- Add registration_data to event_registrations (collected data per registration)
ALTER TABLE public.event_registrations ADD COLUMN registration_data jsonb DEFAULT '{}'::jsonb;

-- Allow event owners to update registrations (for check-in)
CREATE POLICY "Event owners can update registrations"
ON public.event_registrations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.user_id = auth.uid()
  )
);
