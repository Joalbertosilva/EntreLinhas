-- Pedidos de redefinição de senha (fluxo institucional para alunos)

CREATE TYPE public.password_reset_request_status AS ENUM ('pendente', 'atendido', 'cancelado');

CREATE TABLE public.password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome_usuario text NOT NULL,
  status public.password_reset_request_status NOT NULL DEFAULT 'pendente',
  atendido_por uuid REFERENCES public.profiles(id),
  atendido_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_requests_status ON public.password_reset_requests(status);
CREATE INDEX idx_password_reset_requests_profile ON public.password_reset_requests(profile_id);
CREATE INDEX idx_password_reset_requests_created ON public.password_reset_requests(created_at DESC);

ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Professor e administrador veem pedidos pendentes
CREATE POLICY password_reset_requests_select_staff ON public.password_reset_requests
  FOR SELECT TO authenticated
  USING (public.is_professor_or_admin());

-- Staff atualiza status ao atender
CREATE POLICY password_reset_requests_update_staff ON public.password_reset_requests
  FOR UPDATE TO authenticated
  USING (public.is_professor_or_admin())
  WITH CHECK (public.is_professor_or_admin());

-- Inserção apenas via Edge Function (service_role)
