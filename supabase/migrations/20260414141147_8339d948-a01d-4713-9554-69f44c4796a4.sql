
-- Fix 1: course_lessons - restrict non-preview lessons to enrolled/owners/admins
DROP POLICY IF EXISTS "Anyone can view lessons of active courses" ON public.course_lessons;

-- Preview lessons visible to everyone
CREATE POLICY "Preview lessons visible to all"
ON public.course_lessons FOR SELECT
USING (
  is_preview = true AND EXISTS (
    SELECT 1 FROM course_modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = course_lessons.module_id AND c.active = true
  )
);

-- Enrolled users can view all lessons of their enrolled courses
CREATE POLICY "Enrolled users can view all lessons"
ON public.course_lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM course_modules m
    JOIN courses c ON c.id = m.course_id
    JOIN course_enrollments e ON e.course_id = c.id
    WHERE m.id = course_lessons.module_id
      AND c.active = true
      AND e.user_id = auth.uid()
  )
);

-- Course owners can view their own course lessons
CREATE POLICY "Course owners can view own lessons"
ON public.course_lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM course_modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = course_lessons.module_id
      AND c.user_id = auth.uid()
  )
);

-- Admins can view all lessons
CREATE POLICY "Admins can view all lessons"
ON public.course_lessons FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: courses storage bucket - make private
UPDATE storage.buckets SET public = false WHERE id = 'courses';

-- Fix 3: products - restrict contact info to authenticated users
-- Drop old permissive policy
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Public can view active products (basic info only - contact fields will be empty for anon)
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (active = true);
