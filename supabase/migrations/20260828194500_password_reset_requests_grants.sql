-- Tabela criada após migration de grants globais — service_role precisa inserir pedidos
GRANT SELECT, INSERT, UPDATE ON public.password_reset_requests TO service_role;
