ALTER TABLE public.products ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.benefits ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS products_moderation_status_idx ON public.products (moderation_status);
CREATE INDEX IF NOT EXISTS events_moderation_status_idx ON public.events (moderation_status);
CREATE INDEX IF NOT EXISTS opportunities_moderation_status_idx ON public.opportunities (moderation_status);
CREATE INDEX IF NOT EXISTS benefits_moderation_status_idx ON public.benefits (moderation_status);