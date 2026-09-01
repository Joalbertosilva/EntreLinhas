-- Migration: enums e função updated_at
-- RF: base do sistema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.perfil_enum AS ENUM ('aluno', 'professor', 'administrador');
CREATE TYPE public.tipo_conteudo_enum AS ENUM ('livro', 'cronica', 'poema', 'musica', 'frase', 'outro');
CREATE TYPE public.tipo_material_enum AS ENUM ('video', 'audio', 'pagina_externa', 'outro');
CREATE TYPE public.tipo_interacao_enum AS ENUM ('comentario_livre', 'reflexao_orientada');
CREATE TYPE public.status_leitura_enum AS ENUM ('em_andamento', 'concluido');
CREATE TYPE public.tipo_producao_enum AS ENUM ('conto', 'poema', 'cronica', 'reflexao', 'capitulo', 'outro');

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
