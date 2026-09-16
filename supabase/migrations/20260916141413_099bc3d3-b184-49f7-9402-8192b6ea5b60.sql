CREATE OR REPLACE FUNCTION private.enforce_company_active_product_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  active_product_count integer;
BEGIN
  IF NEW.active IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));

  SELECT count(*)
  INTO active_product_count
  FROM public.products
  WHERE user_id = NEW.user_id
    AND active = true
    AND id <> NEW.id;

  IF active_product_count >= 5 THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'Limite de 5 anúncios ativos por empresa atingido.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.enforce_company_active_product_limit() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER enforce_company_active_product_limit
BEFORE INSERT OR UPDATE OF active, user_id ON public.products
FOR EACH ROW
EXECUTE FUNCTION private.enforce_company_active_product_limit();