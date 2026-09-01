-- Staff autenticado precisa ler/atualizar solicitações (RLS restringe a professor/admin)
GRANT SELECT, UPDATE ON public.password_reset_requests TO authenticated;
