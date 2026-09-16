ALTER TABLE public.products
ADD COLUMN installment_count integer NOT NULL DEFAULT 1;

ALTER TABLE public.products
ADD CONSTRAINT products_installment_count_range
CHECK (installment_count BETWEEN 1 AND 36);

ALTER TABLE public.news
ALTER COLUMN status SET DEFAULT 'approved';

DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
CREATE POLICY "Approved companies can publish own products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND moderation_status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.approved = true
  )
);
CREATE POLICY "Approved companies can update own products"
ON public.products FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND moderation_status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.approved = true
  )
);

DROP POLICY IF EXISTS "Users can insert own benefits" ON public.benefits;
DROP POLICY IF EXISTS "Users can update own benefits" ON public.benefits;
CREATE POLICY "Approved companies can publish own benefits"
ON public.benefits FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND moderation_status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.approved = true
  )
);
CREATE POLICY "Approved companies can update own benefits"
ON public.benefits FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND moderation_status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.approved = true
  )
);

DROP POLICY IF EXISTS "Approved companies can submit news" ON public.news;
DROP POLICY IF EXISTS "Owners can update their news for review" ON public.news;
CREATE POLICY "Approved companies can publish own news"
ON public.news FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'approved'
  AND rejection_reason IS NULL
  AND published_at IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = news.profile_id
      AND p.user_id = auth.uid()
      AND p.approved = true
  )
);
CREATE POLICY "Approved companies can update own news"
ON public.news FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'approved'
  AND rejection_reason IS NULL
  AND published_at IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = news.profile_id
      AND p.user_id = auth.uid()
      AND p.approved = true
  )
);