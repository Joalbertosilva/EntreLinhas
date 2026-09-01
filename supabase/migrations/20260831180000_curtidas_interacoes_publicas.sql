-- Curtidas em conteúdos (destaques) + comentários públicos entre alunos

ALTER TABLE public.conteudos
  ADD COLUMN IF NOT EXISTS curtidas_count integer NOT NULL DEFAULT 0;

CREATE TABLE public.conteudo_curtidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conteudo_id uuid NOT NULL REFERENCES public.conteudos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conteudo_curtidas_unique UNIQUE (usuario_id, conteudo_id)
);

CREATE INDEX idx_conteudo_curtidas_conteudo ON public.conteudo_curtidas(conteudo_id);
CREATE INDEX idx_conteudo_curtidas_usuario ON public.conteudo_curtidas(usuario_id);
CREATE INDEX idx_conteudos_curtidas_count ON public.conteudos(curtidas_count DESC);

CREATE OR REPLACE FUNCTION public.sync_conteudo_curtidas_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.conteudos
    SET curtidas_count = curtidas_count + 1
    WHERE id = NEW.conteudo_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.conteudos
    SET curtidas_count = GREATEST(0, curtidas_count - 1)
    WHERE id = OLD.conteudo_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER conteudo_curtidas_count_insert
  AFTER INSERT ON public.conteudo_curtidas
  FOR EACH ROW EXECUTE FUNCTION public.sync_conteudo_curtidas_count();

CREATE TRIGGER conteudo_curtidas_count_delete
  AFTER DELETE ON public.conteudo_curtidas
  FOR EACH ROW EXECUTE FUNCTION public.sync_conteudo_curtidas_count();

-- RLS curtidas
ALTER TABLE public.conteudo_curtidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY conteudo_curtidas_select ON public.conteudo_curtidas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY conteudo_curtidas_insert_aluno ON public.conteudo_curtidas
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND public.get_my_perfil() = 'aluno'
    AND EXISTS (
      SELECT 1 FROM public.conteudos c
      WHERE c.id = conteudo_id AND c.status = true
    )
  );

CREATE POLICY conteudo_curtidas_delete_own ON public.conteudo_curtidas
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno');

-- Alunos podem ler comentários livres de outros (públicos no conteúdo)
CREATE POLICY interacoes_select_public_comments ON public.interacoes
  FOR SELECT TO authenticated
  USING (
    tipo_interacao = 'comentario_livre'
    AND public.get_my_perfil() = 'aluno'
    AND EXISTS (
      SELECT 1 FROM public.conteudos c
      WHERE c.id = interacoes.conteudo_id AND c.status = true
    )
  );

GRANT SELECT, INSERT, DELETE ON public.conteudo_curtidas TO authenticated;
