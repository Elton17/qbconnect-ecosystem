DROP FUNCTION IF EXISTS public.get_waitlist_invitation(text);
DROP FUNCTION IF EXISTS public.decide_waitlist_entry(uuid, text, text, timestamptz);
DROP FUNCTION IF EXISTS public.activate_waitlist_invitation(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text);