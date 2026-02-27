
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text DEFAULT '',
  image_url text DEFAULT '',
  contact_phone text DEFAULT '',
  contact_email text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Users can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
