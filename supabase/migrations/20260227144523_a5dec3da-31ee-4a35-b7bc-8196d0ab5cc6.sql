
-- Course modules table
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course lessons table
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text DEFAULT '',
  video_type text DEFAULT 'upload', -- 'upload', 'youtube', 'vimeo'
  duration_seconds integer DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_preview boolean DEFAULT false, -- free preview lesson
  materials jsonb DEFAULT '[]'::jsonb, -- [{name, url, type}]
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course enrollments
CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(course_id, user_id)
);

-- Lesson progress tracking
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  completed boolean DEFAULT false,
  progress_seconds integer DEFAULT 0,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

-- Course reviews
CREATE TABLE public.course_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- course_modules policies
CREATE POLICY "Anyone can view modules of active courses" ON public.course_modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.active = true)
);
CREATE POLICY "Course owners can insert modules" ON public.course_modules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.user_id = auth.uid())
);
CREATE POLICY "Course owners can update modules" ON public.course_modules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.user_id = auth.uid())
);
CREATE POLICY "Course owners can delete modules" ON public.course_modules FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.user_id = auth.uid())
);

-- course_lessons policies
CREATE POLICY "Anyone can view lessons of active courses" ON public.course_lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.course_modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = course_lessons.module_id AND c.active = true)
);
CREATE POLICY "Course owners can insert lessons" ON public.course_lessons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.course_modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = course_lessons.module_id AND c.user_id = auth.uid())
);
CREATE POLICY "Course owners can update lessons" ON public.course_lessons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.course_modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = course_lessons.module_id AND c.user_id = auth.uid())
);
CREATE POLICY "Course owners can delete lessons" ON public.course_lessons FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.course_modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = course_lessons.module_id AND c.user_id = auth.uid())
);

-- course_enrollments policies
CREATE POLICY "Users can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Course owners can view enrollments" ON public.course_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_enrollments.course_id AND courses.user_id = auth.uid())
);
CREATE POLICY "Users can enroll themselves" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own enrollments" ON public.course_enrollments FOR DELETE USING (auth.uid() = user_id);

-- lesson_progress policies
CREATE POLICY "Users can view own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- course_reviews policies
CREATE POLICY "Anyone can view reviews" ON public.course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.course_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.course_reviews FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for course videos and materials
INSERT INTO storage.buckets (id, name, public) VALUES ('courses', 'courses', true);

-- Storage policies for courses bucket
CREATE POLICY "Anyone can view course files" ON storage.objects FOR SELECT USING (bucket_id = 'courses');
CREATE POLICY "Authenticated users can upload course files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'courses' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own course files" ON storage.objects FOR UPDATE USING (bucket_id = 'courses' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own course files" ON storage.objects FOR DELETE USING (bucket_id = 'courses' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add thumbnail_url to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url text DEFAULT '';
