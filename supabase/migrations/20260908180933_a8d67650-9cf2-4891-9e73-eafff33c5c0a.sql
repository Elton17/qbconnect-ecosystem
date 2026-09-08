-- Data API grants (RLS policies already restrict rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.courses, public.course_modules, public.course_lessons, public.events, public.opportunities, public.benefits, public.promotions, public.profiles, public.learning_paths, public.learning_path_courses, public.course_reviews, public.product_reviews, public.certificates, public.company_contacts, public.course_enrollments, public.lesson_progress, public.event_registrations, public.redemptions, public.waitlist TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON public.products, public.courses, public.course_modules, public.course_lessons, public.events, public.opportunities, public.benefits, public.promotions, public.profiles, public.learning_paths, public.learning_path_courses, public.course_reviews, public.product_reviews, public.certificates, public.company_contacts, public.course_enrollments, public.lesson_progress, public.event_registrations, public.redemptions, public.waitlist, public.user_roles TO service_role;

-- Public (anonymous) read of public catalogue content
GRANT SELECT ON public.products, public.courses, public.course_modules, public.course_lessons, public.events, public.opportunities, public.benefits, public.promotions, public.learning_paths, public.learning_path_courses, public.course_reviews, public.product_reviews TO anon;

-- Anonymous reads of company profiles limited to non-sensitive columns
GRANT SELECT (id, user_id, company_name, segment, city, phone, website, description, logo_url, plan, approved, created_at, updated_at, neighborhood, state, address) ON public.profiles TO anon;

-- Public event registration and waitlist sign-up
GRANT INSERT ON public.event_registrations TO anon;
GRANT INSERT ON public.waitlist TO anon;

-- Function execution
GRANT EXECUTE ON FUNCTION public.get_registration_by_ticket(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_product_contact(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;