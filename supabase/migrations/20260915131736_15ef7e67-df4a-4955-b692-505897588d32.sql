CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 160),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 20 AND 320),
  content text NOT NULL CHECK (char_length(content) BETWEEN 50 AND 20000),
  category text NOT NULL CHECK (char_length(category) BETWEEN 2 AND 60),
  cover_image_path text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text CHECK (rejection_reason IS NULL OR char_length(rejection_reason) <= 500),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved news from approved companies"
ON public.news FOR SELECT TO anon, authenticated
USING (
  status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = news.profile_id AND p.approved = true
  )
);

CREATE POLICY "Owners can view their news"
ON public.news FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Approved companies can submit news"
ON public.news FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND published_at IS NULL
  AND rejection_reason IS NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = news.profile_id AND p.user_id = auth.uid() AND p.approved = true
  )
);

CREATE POLICY "Owners can update their news for review"
ON public.news FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND published_at IS NULL
  AND rejection_reason IS NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = news.profile_id AND p.user_id = auth.uid() AND p.approved = true
  )
);

CREATE POLICY "Owners can delete their news"
ON public.news FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all news"
ON public.news FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all news"
ON public.news FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all news"
ON public.news FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX news_status_published_idx ON public.news (status, published_at DESC);
CREATE INDEX news_user_idx ON public.news (user_id, created_at DESC);
CREATE INDEX news_profile_idx ON public.news (profile_id);

CREATE POLICY "Portal can read news images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'news');

CREATE POLICY "Approved companies can upload news images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'news'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.approved = true
  )
);

CREATE POLICY "Owners can update news images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'news' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'news' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can delete news images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'news' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can manage news images"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'news' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'news' AND public.has_role(auth.uid(), 'admin'));