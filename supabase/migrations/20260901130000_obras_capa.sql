-- Migration: capa da obra do aluno

ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS capa_url text;
