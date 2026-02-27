
CREATE POLICY "Course owners can view certificates" ON public.certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = certificates.course_id
      AND courses.user_id = auth.uid()
    )
  );
