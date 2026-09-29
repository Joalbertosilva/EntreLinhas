-- Posicionamento de vídeos entre seções do catálogo + categoria temática
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'catalog_anchor_enum') THEN
    CREATE TYPE public.catalog_anchor_enum AS ENUM ('livros', 'cronicas', 'musicas', 'poemas');
  END IF;
END $$;

ALTER TABLE public.conteudos
  ADD COLUMN IF NOT EXISTS catalog_anchor public.catalog_anchor_enum,
  ADD COLUMN IF NOT EXISTS video_categoria text;

COMMENT ON COLUMN public.conteudos.catalog_anchor IS 'Seção do catálogo após a qual o vídeo aparece na home';
COMMENT ON COLUMN public.conteudos.video_categoria IS 'Rótulo temático do vídeo (ex.: Importância da leitura)';
