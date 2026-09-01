-- Migration: tipo da obra (livro/cronica/poema) + publicação

CREATE TYPE public.tipo_obra_enum AS ENUM ('livro', 'cronica', 'poema');

ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS tipo public.tipo_obra_enum NOT NULL DEFAULT 'livro',
  ADD COLUMN IF NOT EXISTS publicado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS publicado_em timestamptz;

CREATE INDEX idx_obras_publicadas ON public.obras (publicado, updated_at DESC)
  WHERE publicado = true AND status = true;

-- Leitura de obras publicadas por qualquer usuário autenticado
CREATE POLICY obras_select_publicadas ON public.obras
  FOR SELECT TO authenticated
  USING (publicado = true AND status = true);

CREATE POLICY producoes_select_publicadas ON public.producoes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.obra_itens oi
      JOIN public.obras o ON o.id = oi.obra_id
      WHERE oi.producao_id = producoes.id
        AND oi.status = true
        AND o.publicado = true
        AND o.status = true
    )
  );

CREATE POLICY obra_itens_select_publicadas ON public.obra_itens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.obras o
      WHERE o.id = obra_itens.obra_id
        AND o.publicado = true
        AND o.status = true
    )
  );
