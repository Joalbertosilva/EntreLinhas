import {
  categoriaAcaoAuditoria,
  formatDetalhesAuditoria,
  labelAcaoAuditoria,
  labelExecutorAuditoria,
  type AuditCategoria,
} from '@/lib/auditLabels'
import type {
  AuditActivityConfig,
  AuditActivityPoint,
  AuditLogRow,
  AuditStats,
} from './types'

export function formatAuditDate(iso: string, style: 'short' | 'long' = 'short') {
  const date = new Date(iso)
  if (style === 'long') {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

export function isWithinDays(iso: string, days: number): boolean {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(iso).getTime() >= cutoff
}

export function filterAuditLogs(
  logs: AuditLogRow[],
  categoria: AuditCategoria,
  search: string,
  acoesFilter?: string[] | null,
): AuditLogRow[] {
  const q = search.trim().toLowerCase()
  const acaoSet =
    acoesFilter && acoesFilter.length > 0 ? new Set(acoesFilter) : null

  return logs.filter((log) => {
    if (acaoSet && !acaoSet.has(log.acao)) return false
    if (categoria !== 'all' && categoriaAcaoAuditoria(log.acao) !== categoria) return false
    if (!q) return true

    const haystack = [
      log.acao,
      labelAcaoAuditoria(log.acao),
      log.entidade ?? '',
      log.usuario?.nome ?? '',
      log.usuario?.nome_usuario ?? '',
      formatDetalhesAuditoria(log.detalhes),
      JSON.stringify(log.detalhes ?? {}),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function computeAuditStats(logs: AuditLogRow[]): AuditStats {
  let eventosHoje = 0
  let eventosSemana = 0
  let usuariosCriados = 0
  let conteudosAlterados = 0
  let eventosSenha = 0

  for (const log of logs) {
    const cat = categoriaAcaoAuditoria(log.acao)

    if (isToday(log.created_at)) eventosHoje++
    if (isWithinDays(log.created_at, 7)) eventosSemana++

    if (cat === 'senha') eventosSenha++

    if (log.acao === 'criar_usuario' || log.acao === 'usuario.criar') {
      usuariosCriados++
    }

    if (cat === 'conteudos' && log.acao.includes('atualizar')) {
      conteudosAlterados++
    }
  }

  return {
    eventosHoje,
    eventosSemana,
    usuariosCriados,
    conteudosAlterados,
    eventosSenha,
  }
}

export function computeCategoriaCounts(logs: AuditLogRow[]): Record<string, number> {
  const counts: Record<string, number> = {
    senha: 0,
    usuarios: 0,
    conteudos: 0,
    outros: 0,
  }

  for (const log of logs) {
    const cat = categoriaAcaoAuditoria(log.acao)
    counts[cat] = (counts[cat] ?? 0) + 1
  }

  return counts
}

function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function auditMonthKey(config: AuditActivityConfig): string {
  return `${config.year}-${String(config.month).padStart(2, '0')}`
}

export function filterLogsByActivityConfig(
  logs: AuditLogRow[],
  config: AuditActivityConfig,
): AuditLogRow[] {
  return logs.filter((log) => logMatchesActivityConfig(log.created_at, config))
}

function logMatchesActivityConfig(iso: string, config: AuditActivityConfig): boolean {
  const date = new Date(iso)
  const key = localDateKey(date)

  switch (config.period) {
    case '7d':
      return isWithinDays(iso, 7)
    case '14d':
      return isWithinDays(iso, 14)
    case '30d':
      return isWithinDays(iso, 30)
    case 'month':
      return key.startsWith(auditMonthKey(config))
    case 'year':
      return date.getFullYear() === config.year
  }
}

export function computeActivitySeries(
  logs: AuditLogRow[],
  config: AuditActivityConfig,
): AuditActivityPoint[] {
  const filtered = filterLogsByActivityConfig(logs, config)
  const counts = new Map<string, number>()

  if (config.period === 'year') {
    for (let m = 0; m < 12; m++) {
      const key = `${config.year}-${String(m + 1).padStart(2, '0')}`
      counts.set(key, 0)
    }
    for (const log of filtered) {
      const key = log.created_at.slice(0, 7)
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries()).map(([date, count]) => {
      const parsed = new Date(`${date}-01T12:00:00`)
      return {
        date,
        label: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(parsed),
        tooltip: new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
          parsed,
        ),
        count,
      }
    })
  }

  const buckets: string[] = []

  if (config.period === 'month') {
    const monthKey = auditMonthKey(config)
    const totalDays = daysInMonth(config.year, config.month - 1)
    for (let day = 1; day <= totalDays; day++) {
      buckets.push(`${monthKey}-${String(day).padStart(2, '0')}`)
    }
  } else {
    const days =
      config.period === '7d' ? 7 : config.period === '14d' ? 14 : 30
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setHours(12, 0, 0, 0)
      d.setDate(d.getDate() - i)
      buckets.push(localDateKey(d))
    }
  }

  for (const bucket of buckets) {
    counts.set(bucket, 0)
  }

  for (const log of filtered) {
    const key = log.created_at.slice(0, 10)
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return buckets.map((date) => {
    const parsed = new Date(`${date}T12:00:00`)
    const dayNum = Number(date.slice(8, 10))

    let label: string
    if (config.period === 'month') {
      label = String(dayNum)
    } else if (config.period === 'year') {
      label = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(parsed)
    } else {
      label = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(parsed)
    }

    const tooltip = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsed)

    return {
      date,
      label,
      tooltip,
      count: counts.get(date) ?? 0,
    }
  })
}

export function availableAuditYears(logs: AuditLogRow[]): number[] {
  const years = new Set<number>([new Date().getFullYear()])
  for (const log of logs) {
    years.add(new Date(log.created_at).getFullYear())
  }
  return Array.from(years).sort((a, b) => b - a)
}

const DETALHE_LABELS: Record<string, string> = {
  nome_usuario: 'Usuário',
  titulo: 'Título',
  nome: 'Nome',
  perfil: 'Perfil',
  tema: 'Tema',
  origem: 'Origem',
  profile_id: 'ID do perfil',
}

const ORIGEM_LABELS: Record<string, string> = {
  esqueci_senha: 'Esqueci minha senha',
  perfil: 'Perfil do aluno',
  primeiro_acesso: 'Primeiro acesso',
}

export function formatDetalhesCompletos(
  detalhes: Record<string, unknown> | null,
): Array<{ key: string; label: string; value: string }> {
  if (!detalhes) return []

  return Object.entries(detalhes).map(([key, raw]) => {
    let value = String(raw)
    if (key === 'origem' && typeof raw === 'string' && ORIGEM_LABELS[raw]) {
      value = ORIGEM_LABELS[raw]
    }
    return {
      key,
      label: DETALHE_LABELS[key] ?? key.replaceAll('_', ' '),
      value,
    }
  })
}

export function countLogsByAcao(logs: AuditLogRow[], acoes: string[]): number {
  const set = new Set(acoes)
  return logs.filter((l) => set.has(l.acao)).length
}

export function exportAuditLogsCsv(logs: AuditLogRow[], filename = 'auditoria-entrelinhas.csv') {
  const header = ['Data', 'Executor', 'Usuario', 'Acao', 'Entidade', 'Entidade ID', 'Detalhes']
  const rows = logs.map((log) => [
    formatAuditDate(log.created_at),
    labelExecutorAuditoria(log.usuario, log.acao),
    log.usuario?.nome_usuario ?? '',
    labelAcaoAuditoria(log.acao),
    log.entidade ?? '',
    log.entidade_id ?? '',
    formatDetalhesAuditoria(log.detalhes),
  ])

  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
