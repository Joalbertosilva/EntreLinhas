-- Foto de perfil (avatar_url) + storage avatars/{userId}/ + RPC segura

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.profiles.avatar_url IS
  'URL pública da foto de perfil no bucket covers/avatars/{id}/';

CREATE OR REPLACE FUNCTION public.update_my_avatar_url(p_avatar_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  UPDATE public.profiles
  SET avatar_url = NULLIF(trim(p_avatar_url), '')
  WHERE id = auth.uid()
    AND status = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_my_avatar_url(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_my_avatar_url(text) TO authenticated;

DROP POLICY IF EXISTS storage_covers_avatar_insert ON storage.objects;
DROP POLICY IF EXISTS storage_covers_avatar_update ON storage.objects;
DROP POLICY IF EXISTS storage_covers_avatar_delete ON storage.objects;

CREATE POLICY storage_covers_avatar_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY storage_covers_avatar_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY storage_covers_avatar_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
