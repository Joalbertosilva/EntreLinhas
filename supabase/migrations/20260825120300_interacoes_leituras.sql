-- Migration: interacoes e leituras (RF008, RF009)

CREATE TABLE public.interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles(id),
  conteudo_id uuid NOT NULL REFERENCES public.conteudos(id),
  tipo_interacao public.tipo_interacao_enum NOT NULL,
  tema_id uuid REFERENCES public.temas(id),
  texto text NOT NULL CHECK (char_length(texto) >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interacoes_reflexao_tema CHECK (
    (tipo_interacao = 'reflexao_orientada' AND tema_id IS NOT NULL)
    OR (tipo_interacao = 'comentario_livre')
  )
);

CREATE INDEX idx_interacoes_usuario ON public.interacoes(usuario_id);
CREATE INDEX idx_interacoes_conteudo ON public.interacoes(conteudo_id);

CREATE TRIGGER interacoes_updated_at
  BEFORE UPDATE ON public.interacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.leituras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles(id),
  conteudo_id uuid NOT NULL REFERENCES public.conteudos(id),
  status_leitura public.status_leitura_enum NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leituras_unique_usuario_conteudo UNIQUE (usuario_id, conteudo_id)
);

CREATE INDEX idx_leituras_usuario ON public.leituras(usuario_id);

CREATE TRIGGER leituras_updated_at
  BEFORE UPDATE ON public.leituras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS interacoes
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY interacoes_select_own ON public.interacoes
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY interacoes_select_staff ON public.interacoes
  FOR SELECT TO authenticated
  USING (public.is_professor_or_admin());

CREATE POLICY interacoes_insert_aluno ON public.interacoes
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND public.get_my_perfil() = 'aluno'
  );

CREATE POLICY interacoes_update_own ON public.interacoes
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno')
  WITH CHECK (usuario_id = auth.uid());

-- RLS leituras
ALTER TABLE public.leituras ENABLE ROW LEVEL SECURITY;

CREATE POLICY leituras_select_own ON public.leituras
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY leituras_select_staff ON public.leituras
  FOR SELECT TO authenticated
  USING (public.is_professor_or_admin());

CREATE POLICY leituras_write_aluno ON public.leituras
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno')
  WITH CHECK (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno');
