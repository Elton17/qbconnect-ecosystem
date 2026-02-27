
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  category text DEFAULT 'Networking',
  event_type text DEFAULT 'presencial',
  location text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  online_url text DEFAULT '',
  image_url text DEFAULT '',
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  price numeric DEFAULT 0,
  is_free boolean DEFAULT true,
  max_attendees integer DEFAULT NULL,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text DEFAULT 'confirmed',
  ticket_code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT USING (active = true);
CREATE POLICY "Users can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- Event registrations policies
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Event owners can view registrations" ON public.event_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.user_id = auth.uid())
);
CREATE POLICY "Users can insert own registrations" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own registrations" ON public.event_registrations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
