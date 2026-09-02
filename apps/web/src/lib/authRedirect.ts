import type { Perfil } from '@tcc-sistema/types'
import { getValidSession } from '@/lib/authSession'
import { supabase } from '@/lib/supabase'

export type AuthenticatedPath = '/app' | '/admin' | '/trocar-senha' | '/login'

export function homePathForPerfil(perfil: Perfil): '/app' | '/admin' {
  return perfil === 'aluno' ? '/app' : '/admin'
}

export async function resolveAuthenticatedHomePath(): Promise<AuthenticatedPath> {
  const session = await getValidSession()
  if (!session) return '/login'

  const { data: profile } = await supabase
    .from('profiles')
    .select('perfil, status, deve_trocar_senha')
    .eq('id', session.user.id)
    .single()

  if (!profile?.status) return '/login'
  if (profile.deve_trocar_senha) return '/trocar-senha'
  return homePathForPerfil(profile.perfil as Perfil)
}
