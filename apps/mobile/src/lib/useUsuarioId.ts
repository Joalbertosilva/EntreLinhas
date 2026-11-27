import { useAuth } from '@/providers/AuthProvider'

/** ID do usuário autenticado (perfil ou sessão Supabase). */
export function useUsuarioId(): string | undefined {
  const { profile, session } = useAuth()
  return profile?.id ?? session?.user?.id
}