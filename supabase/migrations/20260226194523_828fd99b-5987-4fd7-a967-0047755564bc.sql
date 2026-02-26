CREATE TABLE public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  benefit_id uuid NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
  code text NOT NULL,
  redeemed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, benefit_id)
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions"
  ON public.redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own redemptions
CREATE POLICY "Users can insert own redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Benefit owners can view redemptions of their benefits
CREATE POLICY "Benefit owners can view redemptions"
  ON public.redemptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.benefits
      WHERE benefits.id = redemptions.benefit_id
        AND benefits.user_id = auth.uid()
    )
  );