-- Migration: conteudos, temas, materiais (RF004, RF005, RF006)

CREATE TABLE public.conteudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL CHECK (char_length(titulo) >= 1),
  tipo public.tipo_conteudo_enum NOT NULL,
  autor text,
  descricao text,
  resumo text,
  personagens text,
  contexto text,
  pontos_importantes text,
  curiosidades text,
  conteudo_textual text,
  capa_url text,
  status boolean NOT NULL DEFAULT true,
  responsavel_id uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conteudos_tipo ON public.conteudos(tipo);
CREATE INDEX idx_conteudos_status ON public.conteudos(status);
CREATE INDEX idx_conteudos_titulo ON public.conteudos(titulo);

CREATE TRIGGER conteudos_updated_at
  BEFORE UPDATE ON public.conteudos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.temas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conteudo_id uuid NOT NULL REFERENCES public.conteudos(id) ON DELETE CASCADE,
  tema text NOT NULL CHECK (char_length(tema) >= 1),
  descricao text,
  ensinamento text,
  questionamento text,
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_temas_conteudo ON public.temas(conteudo_id);

CREATE TRIGGER temas_updated_at
  BEFORE UPDATE ON public.temas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.materiais_complementares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conteudo_id uuid NOT NULL REFERENCES public.conteudos(id) ON DELETE CASCADE,
  titulo text NOT NULL CHECK (char_length(titulo) >= 1),
  tipo public.tipo_material_enum NOT NULL,
  link text NOT NULL CHECK (link ~ '^https?://'),
  descricao text,
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_materiais_conteudo ON public.materiais_complementares(conteudo_id);

CREATE TRIGGER materiais_updated_at
  BEFORE UPDATE ON public.materiais_complementares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS conteudos
ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY conteudos_select_active ON public.conteudos
  FOR SELECT TO authenticated
  USING (
    status = true
    OR public.is_professor_or_admin()
  );

CREATE POLICY conteudos_insert_staff ON public.conteudos
  FOR INSERT TO authenticated
  WITH CHECK (public.is_professor_or_admin() AND responsavel_id = auth.uid());

CREATE POLICY conteudos_update_staff ON public.conteudos
  FOR UPDATE TO authenticated
  USING (public.is_professor_or_admin())
  WITH CHECK (public.is_professor_or_admin());

-- RLS temas
ALTER TABLE public.temas ENABLE ROW LEVEL SECURITY;

CREATE POLICY temas_select ON public.temas
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conteudos c
      WHERE c.id = temas.conteudo_id
        AND (c.status = true OR public.is_professor_or_admin())
    )
    AND (status = true OR public.is_professor_or_admin())
  );

CREATE POLICY temas_write_staff ON public.temas
  FOR ALL TO authenticated
  USING (public.is_professor_or_admin())
  WITH CHECK (public.is_professor_or_admin());

-- RLS materiais
ALTER TABLE public.materiais_complementares ENABLE ROW LEVEL SECURITY;

CREATE POLICY materiais_select ON public.materiais_complementares
  FOR SELECT TO authenticated
  USING (
    status = true
    AND EXISTS (
      SELECT 1 FROM public.conteudos c
      WHERE c.id = materiais_complementares.conteudo_id AND c.status = true
    )
    OR public.is_professor_or_admin()
  );

CREATE POLICY materiais_write_staff ON public.materiais_complementares
  FOR ALL TO authenticated
  USING (public.is_professor_or_admin())
  WITH CHECK (public.is_professor_or_admin());
