-- Add deal closure fields to opportunities table
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open';
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS interested_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS closed_with text DEFAULT '';
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS deal_value numeric DEFAULT NULL;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS closed_at timestamptz DEFAULT NULL;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS deal_feedback text DEFAULT '';

-- Allow public to view closed opportunities (not just active ones)
CREATE POLICY "Anyone can view closed opportunities"
ON public.opportunities
FOR SELECT
USING (status = 'closed');