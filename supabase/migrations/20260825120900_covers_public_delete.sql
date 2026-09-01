-- Capas públicas (alunos visualizam) + DELETE de conteúdos pelo staff

UPDATE storage.buckets SET public = true WHERE id = 'covers';

CREATE POLICY conteudos_delete_staff ON public.conteudos
  FOR DELETE TO authenticated
  USING (public.is_professor_or_admin());
