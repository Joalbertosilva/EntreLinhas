import type { Perfil } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

export function homePathForPerfil(_perfil: Perfil): '/app' {
  return '/app'
}

export async function resolveAuthenticatedHomePath(): Promise<'/app' | '/login'> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return '/login'

  const { data: profile } = await supabase
    .from('profiles')
    .select('perfil, status')
    .eq('id', session.user.id)
    .single()

  if (!profile?.status) return '/login'
  return homePathForPerfil(profile.perfil as Perfil)
}
