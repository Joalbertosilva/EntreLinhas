-- Foto original da capa (para regerar a capa conceitual ao mudar o gênero)
ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS capa_foto_url text;

COMMENT ON COLUMN public.obras.capa_foto_url IS
  'URL da foto recortada enviada pelo aluno (Storage). capa_url é a imagem composta.';
