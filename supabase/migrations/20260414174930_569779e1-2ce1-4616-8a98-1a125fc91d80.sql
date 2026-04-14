
-- Add level and instructor_name to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'iniciante';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_name text DEFAULT '';

-- Create learning_paths table
CREATE TABLE public.learning_paths (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  thumbnail_url text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL
);

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active learning paths" ON public.learning_paths FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all learning paths" ON public.learning_paths FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert learning paths" ON public.learning_paths FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update learning paths" ON public.learning_paths FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete learning paths" ON public.learning_paths FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Create learning_path_courses junction table
CREATE TABLE public.learning_path_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE(learning_path_id, course_id)
);

ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning path courses" ON public.learning_path_courses FOR SELECT USING (true);
CREATE POLICY "Admins can insert learning path courses" ON public.learning_path_courses FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update learning path courses" ON public.learning_path_courses FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete learning path courses" ON public.learning_path_courses FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on learning_paths
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
