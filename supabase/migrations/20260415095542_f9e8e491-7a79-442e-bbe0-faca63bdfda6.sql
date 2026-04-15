
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can increment product counters" ON public.products;

-- Create secure functions to increment counters
CREATE OR REPLACE FUNCTION public.increment_product_view(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products SET view_count = view_count + 1 WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_product_contact(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products SET contact_count = contact_count + 1 WHERE id = p_id;
$$;
