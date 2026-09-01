-- Migration: alunos podem enviar capa da própria obra (bucket covers/obras/{userId}/...)

CREATE POLICY storage_covers_obra_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = 'obras'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND public.get_my_perfil() = 'aluno'
  );

CREATE POLICY storage_covers_obra_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = 'obras'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND public.get_my_perfil() = 'aluno'
  );

CREATE POLICY storage_covers_obra_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = 'obras'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND public.get_my_perfil() = 'aluno'
  );
