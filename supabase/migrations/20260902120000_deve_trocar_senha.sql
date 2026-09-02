-- RF002 — troca obrigatória de senha após senha temporária

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deve_trocar_senha boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.deve_trocar_senha IS
  'Quando true, o usuário deve definir nova senha antes de usar o sistema.';

CREATE OR REPLACE FUNCTION public.clear_deve_trocar_senha()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  UPDATE public.profiles
  SET deve_trocar_senha = false
  WHERE id = auth.uid() AND deve_trocar_senha = true;
END;
$$;

REVOKE ALL ON FUNCTION public.clear_deve_trocar_senha() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clear_deve_trocar_senha() TO authenticated;
