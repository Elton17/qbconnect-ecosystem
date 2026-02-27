
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS neighborhood text DEFAULT '',
  ADD COLUMN IF NOT EXISTS complement text DEFAULT '',
  ADD COLUMN IF NOT EXISTS reference_point text DEFAULT '',
  ADD COLUMN IF NOT EXISTS zip_code text DEFAULT '',
  ADD COLUMN IF NOT EXISTS state text DEFAULT '';
