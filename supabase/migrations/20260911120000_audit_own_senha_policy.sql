-- Permite que qualquer usuário autenticado registre auditoria da própria troca de senha (RS007)

CREATE POLICY audit_logs_insert_own_senha ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND acao IN ('senha.alterar', 'senha.troca_obrigatoria')
  );
