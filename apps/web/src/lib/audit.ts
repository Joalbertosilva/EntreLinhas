import { supabase } from '@/lib/supabase'

interface AuditPayload {
  acao: string
  entidade?: string
  entidade_id?: string
  detalhes?: Record<string, unknown>
}

/** RS007 — registro best-effort; não bloqueia a operação principal */
export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('audit_logs').insert({
      usuario_id: user.id,
      acao: payload.acao,
      entidade: payload.entidade ?? null,
      entidade_id: payload.entidade_id ?? null,
      detalhes: payload.detalhes ?? null,
    })
  } catch {
    // Auditoria não deve impedir fluxo do usuário
  }
}
