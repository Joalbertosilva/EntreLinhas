-- Permite exclusão permanente de conteúdos (cascade + RLS em tabelas filhas)

ALTER TABLE public.interacoes
  DROP CONSTRAINT IF EXISTS interacoes_conteudo_id_fkey;

ALTER TABLE public.interacoes
  ADD CONSTRAINT interacoes_conteudo_id_fkey
    FOREIGN KEY (conteudo_id) REFERENCES public.conteudos(id) ON DELETE CASCADE;

ALTER TABLE public.leituras
  DROP CONSTRAINT IF EXISTS leituras_conteudo_id_fkey;

ALTER TABLE public.leituras
  ADD CONSTRAINT leituras_conteudo_id_fkey
    FOREIGN KEY (conteudo_id) REFERENCES public.conteudos(id) ON DELETE CASCADE;

ALTER TABLE public.interacoes
  DROP CONSTRAINT IF EXISTS interacoes_tema_id_fkey;

ALTER TABLE public.interacoes
  ADD CONSTRAINT interacoes_tema_id_fkey
    FOREIGN KEY (tema_id) REFERENCES public.temas(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS interacoes_delete_staff ON public.interacoes;

CREATE POLICY interacoes_delete_staff ON public.interacoes
  FOR DELETE TO authenticated
  USING (public.is_professor_or_admin());

DROP POLICY IF EXISTS leituras_delete_staff ON public.leituras;

CREATE POLICY leituras_delete_staff ON public.leituras
  FOR DELETE TO authenticated
  USING (public.is_professor_or_admin());