-- Migration: audit_logs (RS007) + views de evolução (RF010, RF013, RF014)

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.profiles(id),
  acao text NOT NULL,
  entidade text,
  entidade_id uuid,
  detalhes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_usuario ON public.audit_logs(usuario_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select_admin ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY audit_logs_insert_service ON public.audit_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY audit_logs_insert_authenticated ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- View: evolução do aluno (RF010, RF013)
CREATE OR REPLACE VIEW public.evolucao_aluno AS
SELECT
  p.id AS usuario_id,
  p.nome,
  p.nome_usuario,
  COUNT(DISTINCT l.id) FILTER (WHERE l.status_leitura = 'concluido') AS quantidade_concluida,
  COUNT(DISTINCT l.id) FILTER (WHERE l.status_leitura = 'concluido') * 10 AS pontuacao,
  CASE
    WHEN (SELECT COUNT(*) FROM public.conteudos WHERE status = true) = 0 THEN 0
    ELSE ROUND(
      (COUNT(DISTINCT l.id) FILTER (WHERE l.status_leitura = 'concluido')::numeric
        / (SELECT COUNT(*) FROM public.conteudos WHERE status = true)) * 100, 2
    )
  END AS percentual_progresso,
  GREATEST(
    COALESCE((SELECT MAX(i.created_at) FROM public.interacoes i WHERE i.usuario_id = p.id), '1970-01-01'::timestamptz),
    COALESCE((SELECT MAX(l.updated_at) FROM public.leituras l WHERE l.usuario_id = p.id), '1970-01-01'::timestamptz),
    COALESCE((SELECT MAX(pr.updated_at) FROM public.producoes pr WHERE pr.usuario_id = p.id), '1970-01-01'::timestamptz)
  ) AS ultima_interacao
FROM public.profiles p
LEFT JOIN public.leituras l ON l.usuario_id = p.id
WHERE p.perfil = 'aluno' AND p.status = true
GROUP BY p.id, p.nome, p.nome_usuario;

-- View: visão administrativa (RF014)
CREATE OR REPLACE VIEW public.visao_administrativa AS
SELECT
  (SELECT COUNT(*) FROM public.profiles WHERE status = true) AS quantidade_usuarios,
  (SELECT COUNT(*) FROM public.profiles WHERE perfil = 'aluno' AND status = true) AS quantidade_alunos,
  (SELECT COUNT(*) FROM public.profiles WHERE perfil = 'professor' AND status = true) AS quantidade_professores,
  (SELECT COUNT(*) FROM public.conteudos WHERE status = true) AS quantidade_conteudos;
