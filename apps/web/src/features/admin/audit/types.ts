export interface AuditLogRow {
  id: string
  acao: string
  entidade: string | null
  entidade_id: string | null
  detalhes: Record<string, unknown> | null
  created_at: string
  usuario: { nome: string; nome_usuario: string } | null
}

export type AuditViewTab = 'lista' | 'timeline' | 'fluxo' | 'resumo'

export type AuditActivityPeriod = '7d' | '14d' | '30d' | 'month' | 'year'

export interface AuditActivityConfig {
  period: AuditActivityPeriod
  /** 1 = janeiro … 12 = dezembro */
  month: number
  year: number
}

export interface AuditActivityPoint {
  date: string
  label: string
  tooltip: string
  count: number
}

export interface AuditStats {
  eventosHoje: number
  eventosSemana: number
  usuariosCriados: number
  conteudosAlterados: number
  eventosSenha: number
}
