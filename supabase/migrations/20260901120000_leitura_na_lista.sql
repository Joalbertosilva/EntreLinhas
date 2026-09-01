-- Migration: status "na_lista" para lista de leitura (ler depois)

ALTER TYPE public.status_leitura_enum ADD VALUE IF NOT EXISTS 'na_lista';
