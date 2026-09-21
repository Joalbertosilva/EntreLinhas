import { Clock } from 'lucide-react'
import {
  formatDetalhesAuditoria,
  labelAcaoAuditoria,
  labelExecutorAuditoria,
} from '@/lib/auditLabels'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { formatAuditDate } from './auditUtils'
import type { AuditLogRow } from './types'

interface AuditTimelineViewProps {
  logs: AuditLogRow[]
  selectedId: string | null
  onSelect: (log: AuditLogRow) => void
  emptyMessage: string
}

function groupByDate(logs: AuditLogRow[]): Array<{ date: string; label: string; items: AuditLogRow[] }> {
  const map = new Map<string, AuditLogRow[]>()

  for (const log of logs) {
    const key = log.created_at.slice(0, 10)
    const group = map.get(key) ?? []
    group.push(log)
    map.set(key, group)
  }

  return Array.from(map.entries()).map(([date, items]) => ({
    date,
    label: new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date + 'T12:00:00')),
    items,
  }))
}

export function AuditTimelineView({
  logs,
  selectedId,
  onSelect,
  emptyMessage,
}: AuditTimelineViewProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Clock className="mb-3 h-10 w-10 text-text-muted/40" strokeWidth={1.5} />
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </div>
    )
  }

  const groups = groupByDate(logs)

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {groups.map((group) => (
        <section key={group.date}>
          <h3 className="mb-4 text-sm font-semibold capitalize text-text">{group.label}</h3>
          <ol className="relative space-y-0 border-l-2 border-primary/20 pl-6">
            {group.items.map((log, idx) => (
              <li key={log.id} className="relative pb-6 last:pb-0">
                <span
                  className={cn(
                    'absolute -left-[1.5625rem] top-1.5 flex h-3 w-3 rounded-full border-2 border-white',
                    selectedId === log.id ? 'bg-accent ring-2 ring-accent/30' : 'bg-primary',
                  )}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => onSelect(log)}
                  className={cn(
                    'w-full rounded-xl border border-border bg-white p-4 text-left transition-colors',
                    'hover:border-primary/30 hover:bg-primary-light/20',
                    selectedId === log.id && 'border-primary/40 bg-primary-light/30',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs tabular-nums text-text-muted">
                        {formatAuditDate(log.created_at)}
                      </p>
                      <p className="mt-1 font-semibold text-text">
                        {labelAcaoAuditoria(log.acao)}
                      </p>
                      <p className="mt-0.5 text-sm text-text-muted">
                        {labelExecutorAuditoria(log.usuario, log.acao)}
                        {log.usuario ? ` · @${log.usuario.nome_usuario}` : ''}
                      </p>
                    </div>
                    <Badge variant="primary" className="shrink-0">
                      #{idx + 1}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">
                    {formatDetalhesAuditoria(log.detalhes)}
                  </p>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
