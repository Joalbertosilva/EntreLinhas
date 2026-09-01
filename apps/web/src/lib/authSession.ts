import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/**
 * Valida o JWT com o servidor (getUser) em vez de confiar só no cache local (getSession).
 * Evita sessões inválidas após troca de projeto Supabase (local → nuvem).
 */
export async function getValidSession(): Promise<Session | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    if (error) await supabase.auth.signOut()
    return null
  }

  const { data: { session } } = await supabase.auth.getSession()
  return session
}
