DROP POLICY IF EXISTS "Portal can read news images" ON storage.objects;

CREATE POLICY "Public can read approved news images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'news'
  AND EXISTS (
    SELECT 1
    FROM public.news n
    WHERE n.cover_image_path = storage.objects.name
      AND n.status = 'approved'
  )
);

CREATE POLICY "Owners can read news images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'news'
  AND (storage.foldername(name))[1] = auth.uid()::text
);