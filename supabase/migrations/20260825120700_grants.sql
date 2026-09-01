-- Migration: grants para roles Supabase (service_role, authenticated, anon)

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Views
GRANT SELECT ON public.evolucao_aluno TO authenticated;
GRANT SELECT ON public.visao_administrativa TO authenticated;

-- Storage (já gerenciado por policies, mas garantir usage)
GRANT USAGE ON SCHEMA storage TO authenticated, service_role;
