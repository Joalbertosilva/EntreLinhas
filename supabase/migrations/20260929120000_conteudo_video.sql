-- Tipo de conteúdo "video" + URL do YouTube no catálogo principal
ALTER TYPE public.tipo_conteudo_enum ADD VALUE IF NOT EXISTS 'video';

ALTER TABLE public.conteudos
  ADD COLUMN IF NOT EXISTS video_url text;

COMMENT ON COLUMN public.conteudos.video_url IS 'URL do YouTube quando tipo = video';
