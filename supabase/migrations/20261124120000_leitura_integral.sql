-- Leitura integral (obra em domínio público, capítulos na plataforma)

CREATE TYPE public.licenca_leitura_integral_enum AS ENUM (
  'dominio_publico',
  'sem_leitura_integral'
);

CREATE TYPE public.metodo_traducao_integral_enum AS ENUM (
  'preimportado',
  'pt_nativo',
  'nao_aplicavel'
);

CREATE TYPE public.status_leitura_integral_enum AS ENUM (
  'em_andamento',
  'concluido'
);

ALTER TABLE public.conteudos
  ADD COLUMN IF NOT EXISTS integral_ativa boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS integral_licenca public.licenca_leitura_integral_enum,
  ADD COLUMN IF NOT EXISTS integral_fonte_url text,
  ADD COLUMN IF NOT EXISTS integral_traducao_metodo public.metodo_traducao_integral_enum,
  ADD COLUMN IF NOT EXISTS integral_traducao_credito text;

COMMENT ON COLUMN public.conteudos.integral_ativa IS 'Exibe leitura integral (capítulos) após concluir estudo';
COMMENT ON COLUMN public.conteudos.integral_licenca IS 'dominio_publico permite integral; sem_leitura_integral bloqueia';
COMMENT ON COLUMN public.conteudos.integral_fonte_url IS 'URL da obra original (Gutenberg etc.) — documentação';
COMMENT ON COLUMN public.conteudos.integral_traducao_metodo IS 'Como o PT foi obtido (sem API paga em runtime)';
COMMENT ON COLUMN public.conteudos.integral_traducao_credito IS 'Crédito exibido ao aluno (ex.: EntreLinhas)';

CREATE TABLE public.conteudo_capitulos_integral (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conteudo_id uuid NOT NULL REFERENCES public.conteudos(id) ON DELETE CASCADE,
  ordem integer NOT NULL CHECK (ordem >= 1),
  titulo text NOT NULL CHECK (char_length(titulo) >= 1),
  texto_pt text NOT NULL CHECK (char_length(texto_pt) >= 1),
  texto_origem text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conteudo_capitulos_integral_ordem_unique UNIQUE (conteudo_id, ordem)
);

CREATE INDEX idx_capitulos_integral_conteudo ON public.conteudo_capitulos_integral(conteudo_id);

CREATE TRIGGER conteudo_capitulos_integral_updated_at
  BEFORE UPDATE ON public.conteudo_capitulos_integral
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.leituras
  ADD COLUMN IF NOT EXISTS integral_status public.status_leitura_integral_enum;

COMMENT ON COLUMN public.leituras.integral_status IS 'Progresso da leitura integral (após estudo concluído)';

-- RLS capítulos
ALTER TABLE public.conteudo_capitulos_integral ENABLE ROW LEVEL SECURITY;

CREATE POLICY capitulos_integral_select ON public.conteudo_capitulos_integral
  FOR SELECT TO authenticated
  USING (
    public.is_professor_or_admin()
    OR EXISTS (
      SELECT 1 FROM public.conteudos c
      WHERE c.id = conteudo_capitulos_integral.conteudo_id
        AND c.status = true
        AND c.integral_ativa = true
        AND c.integral_licenca = 'dominio_publico'
    )
  );

CREATE POLICY capitulos_integral_write_staff ON public.conteudo_capitulos_integral
  FOR ALL TO authenticated
  USING (public.is_professor_or_admin())
  WITH CHECK (public.is_professor_or_admin());