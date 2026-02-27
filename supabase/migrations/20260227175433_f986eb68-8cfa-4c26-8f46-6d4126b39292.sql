
-- Admin can view ALL courses (including inactive)
CREATE POLICY "Admins can view all courses"
ON public.courses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update any course
CREATE POLICY "Admins can update any course"
ON public.courses FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any course
CREATE POLICY "Admins can delete any course"
ON public.courses FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL events (including inactive)
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update any event
CREATE POLICY "Admins can update any event"
ON public.events FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any event
CREATE POLICY "Admins can delete any event"
ON public.events FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL opportunities (including inactive)
CREATE POLICY "Admins can view all opportunities"
ON public.opportunities FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update any opportunity
CREATE POLICY "Admins can update any opportunity"
ON public.opportunities FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any opportunity
CREATE POLICY "Admins can delete any opportunity"
ON public.opportunities FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL benefits (including inactive)
CREATE POLICY "Admins can view all benefits"
ON public.benefits FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update any benefit
CREATE POLICY "Admins can update any benefit"
ON public.benefits FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any benefit
CREATE POLICY "Admins can delete any benefit"
ON public.benefits FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL products (update + delete)
CREATE POLICY "Admins can update any product"
ON public.products FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any product"
ON public.products FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL promotions (including inactive/expired)
CREATE POLICY "Admins can view all promotions"
ON public.promotions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any promotion"
ON public.promotions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any promotion"
ON public.promotions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all event registrations
CREATE POLICY "Admins can view all event registrations"
ON public.event_registrations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all course enrollments
CREATE POLICY "Admins can view all course enrollments"
ON public.course_enrollments FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all certificates
CREATE POLICY "Admins can view all certificates"
ON public.certificates FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can insert/update/delete user roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all redemptions
CREATE POLICY "Admins can view all redemptions"
ON public.redemptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete profiles
CREATE POLICY "Admins can delete any profile"
ON public.profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
