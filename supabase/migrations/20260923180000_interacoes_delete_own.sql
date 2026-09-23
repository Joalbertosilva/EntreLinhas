-- Permite alunos excluírem próprias interações (reflexões privadas e comentários públicos)

CREATE POLICY interacoes_delete_own ON public.interacoes
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno');
