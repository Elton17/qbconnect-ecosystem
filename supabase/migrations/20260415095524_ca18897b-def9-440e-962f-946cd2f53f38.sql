
-- Add new columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_type text NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS city text NULL DEFAULT '';

-- Create product_reviews table
CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint: one review per user per product
ALTER TABLE public.product_reviews ADD CONSTRAINT unique_product_review UNIQUE (product_id, reviewer_user_id);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_reviews
CREATE POLICY "Anyone can view reviews of active products"
  ON public.product_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products WHERE products.id = product_reviews.product_id AND products.active = true
  ));

CREATE POLICY "Users can insert own reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_user_id);

CREATE POLICY "Users can update own reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = reviewer_user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = reviewer_user_id);

CREATE POLICY "Admins can view all reviews"
  ON public.product_reviews FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any review"
  ON public.product_reviews FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any review"
  ON public.product_reviews FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anyone to increment view_count and contact_count (for anonymous views)
CREATE POLICY "Anyone can increment product counters"
  ON public.products FOR UPDATE
  USING (true)
  WITH CHECK (true);
