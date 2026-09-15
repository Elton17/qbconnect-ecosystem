DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view approved active products"
ON public.products FOR SELECT TO public
USING (active = true AND moderation_status = 'approved');

DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
CREATE POLICY "Anyone can view approved active events"
ON public.events FOR SELECT TO public
USING (active = true AND moderation_status = 'approved');

DROP POLICY IF EXISTS "Anyone can view active opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Anyone can view closed opportunities" ON public.opportunities;
CREATE POLICY "Anyone can view approved opportunities"
ON public.opportunities FOR SELECT TO public
USING (moderation_status = 'approved' AND (active = true OR status = 'closed'));

DROP POLICY IF EXISTS "Anyone can view active benefits" ON public.benefits;
CREATE POLICY "Anyone can view approved active benefits"
ON public.benefits FOR SELECT TO public
USING (active = true AND moderation_status = 'approved');