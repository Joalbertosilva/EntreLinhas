-- Permite professor/admin consultar perfis de alunos (RF013 — acompanhamento)

CREATE POLICY profiles_select_staff_alunos ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_professor_or_admin() AND perfil = 'aluno');
