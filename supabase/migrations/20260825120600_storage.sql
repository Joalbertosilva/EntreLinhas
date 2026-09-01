-- Migration: Storage buckets (capas e mídia)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('covers', 'covers', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('media', 'media', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Leitura: usuários autenticados
CREATE POLICY storage_covers_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'covers');

CREATE POLICY storage_media_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media');

-- Escrita: professor e admin
CREATE POLICY storage_covers_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'covers' AND public.is_professor_or_admin());

CREATE POLICY storage_covers_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'covers' AND public.is_professor_or_admin());

CREATE POLICY storage_covers_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'covers' AND public.is_professor_or_admin());

CREATE POLICY storage_media_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_professor_or_admin());

CREATE POLICY storage_media_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_professor_or_admin());

CREATE POLICY storage_media_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_professor_or_admin());
