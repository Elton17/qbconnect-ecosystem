ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS decision_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS decision_at timestamptz,
  ADD COLUMN IF NOT EXISTS invitation_token_hash text,
  ADD COLUMN IF NOT EXISTS invitation_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS activated_user_id uuid;

ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_decision_status_valid
  CHECK (decision_status IN ('pending', 'accepted', 'rejected', 'activated'));

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_invitation_token_hash_key
  ON public.waitlist (invitation_token_hash)
  WHERE invitation_token_hash IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_waitlist_invitation(_token text)
RETURNS TABLE (
  company_name text,
  contact_name text,
  whatsapp text,
  segment text,
  cnpj text,
  decision_status text,
  invitation_expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    w.company_name,
    w.contact_name,
    w.whatsapp,
    w.segment,
    w.cnpj,
    w.decision_status,
    w.invitation_expires_at
  FROM public.waitlist w
  WHERE w.invitation_token_hash = encode(extensions.digest(_token, 'sha256'), 'hex')
    AND w.decision_status = 'accepted'
    AND w.activated_at IS NULL
    AND w.invitation_expires_at > now()
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_waitlist_invitation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_waitlist_invitation(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.decide_waitlist_entry(
  _waitlist_id uuid,
  _decision text,
  _token_hash text DEFAULT NULL,
  _expires_at timestamptz DEFAULT NULL
)
RETURNS public.waitlist
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.waitlist;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF _decision NOT IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'Decisão inválida';
  END IF;

  IF _decision = 'accepted' AND (_token_hash IS NULL OR _expires_at IS NULL OR _expires_at <= now()) THEN
    RAISE EXCEPTION 'Convite inválido';
  END IF;

  UPDATE public.waitlist
  SET decision_status = _decision,
      decision_at = now(),
      invitation_token_hash = CASE WHEN _decision = 'accepted' THEN _token_hash ELSE NULL END,
      invitation_expires_at = CASE WHEN _decision = 'accepted' THEN _expires_at ELSE NULL END
  WHERE id = _waitlist_id
    AND activated_at IS NULL
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Pré-cadastro não encontrado ou já ativado';
  END IF;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.decide_waitlist_entry(uuid, text, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decide_waitlist_entry(uuid, text, text, timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.activate_waitlist_invitation(
  _token text,
  _company_name text,
  _cnpj text,
  _segment text,
  _city text,
  _state text,
  _phone text,
  _contact_name text,
  _contact_role text,
  _contact_email text,
  _contact_phone text,
  _website text DEFAULT NULL,
  _description text DEFAULT NULL,
  _address text DEFAULT NULL,
  _neighborhood text DEFAULT NULL,
  _complement text DEFAULT NULL,
  _reference_point text DEFAULT NULL,
  _zip_code text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  invitation public.waitlist;
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária';
  END IF;

  SELECT * INTO invitation
  FROM public.waitlist
  WHERE invitation_token_hash = encode(extensions.digest(_token, 'sha256'), 'hex')
    AND decision_status = 'accepted'
    AND activated_at IS NULL
    AND invitation_expires_at > now()
  FOR UPDATE;

  IF invitation.id IS NULL THEN
    RAISE EXCEPTION 'Convite inválido, vencido ou já utilizado';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE cnpj = _cnpj AND user_id <> current_user_id
  ) THEN
    RAISE EXCEPTION 'CNPJ já cadastrado';
  END IF;

  UPDATE public.profiles
  SET company_name = trim(_company_name),
      cnpj = trim(_cnpj),
      segment = trim(_segment),
      city = trim(_city),
      state = trim(_state),
      phone = trim(_phone),
      email = trim(_contact_email),
      website = nullif(trim(_website), ''),
      description = nullif(trim(_description), ''),
      address = nullif(trim(_address), ''),
      neighborhood = nullif(trim(_neighborhood), ''),
      complement = nullif(trim(_complement), ''),
      reference_point = nullif(trim(_reference_point), ''),
      zip_code = nullif(trim(_zip_code), ''),
      contact_name = trim(_contact_name),
      contact_role = trim(_contact_role),
      contact_email = trim(_contact_email),
      contact_phone = trim(_contact_phone),
      approved = true,
      updated_at = now()
  WHERE user_id = current_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil da conta não encontrado';
  END IF;

  UPDATE public.waitlist
  SET decision_status = 'activated',
      activated_at = now(),
      activated_user_id = current_user_id,
      invitation_token_hash = NULL,
      invitation_expires_at = NULL
  WHERE id = invitation.id;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_waitlist_invitation(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_waitlist_invitation(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text) TO authenticated;