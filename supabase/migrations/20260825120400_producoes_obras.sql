-- Migration: producoes e obras (RF011, RF012)

CREATE TABLE public.producoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles(id),
  titulo text NOT NULL CHECK (char_length(titulo) >= 1),
  tipo public.tipo_producao_enum NOT NULL,
  texto text,
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_producoes_usuario ON public.producoes(usuario_id);

CREATE TRIGGER producoes_updated_at
  BEFORE UPDATE ON public.producoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.obras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles(id),
  titulo text NOT NULL CHECK (char_length(titulo) >= 1),
  descricao text,
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_obras_usuario ON public.obras(usuario_id);

CREATE TRIGGER obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.obra_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  producao_id uuid NOT NULL REFERENCES public.producoes(id),
  ordem integer NOT NULL CHECK (ordem >= 1),
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_obra_itens_obra ON public.obra_itens(obra_id);

-- RLS producoes
ALTER TABLE public.producoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY producoes_select_own ON public.producoes
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY producoes_select_staff ON public.producoes
  FOR SELECT TO authenticated
  USING (public.is_professor_or_admin());

CREATE POLICY producoes_write_own ON public.producoes
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno')
  WITH CHECK (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno');

-- RLS obras
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY obras_select_own ON public.obras
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY obras_select_staff ON public.obras
  FOR SELECT TO authenticated
  USING (public.is_professor_or_admin());

CREATE POLICY obras_write_own ON public.obras
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno')
  WITH CHECK (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno');

-- RLS obra_itens
ALTER TABLE public.obra_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY obra_itens_via_obra ON public.obra_itens
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.obras o WHERE o.id = obra_id AND o.usuario_id = auth.uid())
    OR public.is_professor_or_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.obras o WHERE o.id = obra_id AND o.usuario_id = auth.uid())
    AND public.get_my_perfil() = 'aluno'
  );
