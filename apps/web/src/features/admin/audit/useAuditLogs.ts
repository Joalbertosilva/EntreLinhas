import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AuditLogRow } from './types'

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(
          'id, acao, entidade, entidade_id, detalhes, created_at, profiles!audit_logs_usuario_id_fkey(nome, nome_usuario)',
        )
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error

      return (data ?? []).map((row) => {
        const profile = row.profiles
        const usuario = Array.isArray(profile) ? profile[0] ?? null : profile
        return {
          id: row.id,
          acao: row.acao,
          entidade: row.entidade,
          entidade_id: row.entidade_id,
          detalhes: row.detalhes as Record<string, unknown> | null,
          created_at: row.created_at,
          usuario,
        }
      }) as AuditLogRow[]
    },
  })
}
