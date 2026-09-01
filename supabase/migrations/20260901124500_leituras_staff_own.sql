-- Migration: professor e administrador também gerenciam suas próprias leituras

DROP POLICY IF EXISTS leituras_write_aluno ON public.leituras;

CREATE POLICY leituras_write_own ON public.leituras
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());
