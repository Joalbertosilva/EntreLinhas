-- Professores também registram auditoria (CRUD conteúdos)

DROP POLICY IF EXISTS audit_logs_insert_authenticated ON public.audit_logs;

CREATE POLICY audit_logs_insert_staff ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_professor_or_admin());
