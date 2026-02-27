
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  discount_percent integer NOT NULL DEFAULT 10,
  original_price numeric DEFAULT NULL,
  promo_price numeric DEFAULT NULL,
  category text DEFAULT '',
  image_url text DEFAULT '',
  expires_at timestamp with time zone NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promotions" ON public.promotions FOR SELECT USING (active = true AND expires_at > now());
CREATE POLICY "Users can insert own promotions" ON public.promotions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own promotions" ON public.promotions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own promotions" ON public.promotions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
