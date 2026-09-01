-- Migration: profiles (RF001, RF002, RF015)
-- Login via nome_usuario mapeado para auth email: {nome}@tcc-sistema.internal

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(nome) >= 2),
  nome_usuario text NOT NULL CHECK (char_length(nome_usuario) >= 3),
  perfil public.perfil_enum NOT NULL,
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_nome_usuario_unique UNIQUE (nome_usuario),
  CONSTRAINT profiles_nome_usuario_format CHECK (nome_usuario ~ '^[a-zA-Z0-9._-]+$')
);

CREATE INDEX idx_profiles_nome_usuario ON public.profiles(nome_usuario);
CREATE INDEX idx_profiles_perfil ON public.profiles(perfil);
CREATE INDEX idx_profiles_status ON public.profiles(status);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Funções auxiliares (antes das policies RLS)
CREATE OR REPLACE FUNCTION public.get_my_perfil()
RETURNS public.perfil_enum
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT perfil FROM public.profiles WHERE id = auth.uid() AND status = true;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_my_perfil() = 'administrador';
$$;

CREATE OR REPLACE FUNCTION public.is_professor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_my_perfil() IN ('professor', 'administrador');
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY profiles_insert_service ON public.profiles
  FOR INSERT TO service_role
  WITH CHECK (true);

COMMENT ON TABLE public.profiles IS 'Perfis de usuário — RF001. Auth email: {nome_usuario}@tcc-sistema.internal';
