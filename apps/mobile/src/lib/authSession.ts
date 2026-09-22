import type { Perfil } from '@tcc-sistema/types'
import { canUseMobileApp } from '@/lib/perfilLabels'
import { supabase } from '@/lib/supabase'

export interface AuthProfile {
  id: string
  perfil: Perfil
  status: boolean
  deve_trocar_senha: boolean
  nome: string
  nome_usuario: string
}

export async function fetchAuthProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, perfil, status, deve_trocar_senha, nome, nome_usuario')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as AuthProfile
}

export async function resolvePostLoginRoute(profile: AuthProfile): Promise<string> {
  if (!profile.status) return '/(auth)/login'
  if (profile.deve_trocar_senha) return '/(auth)/trocar-senha'
  if (!canUseMobileApp(profile.perfil)) return '/(auth)/login'
  return '/(aluno)'
}
