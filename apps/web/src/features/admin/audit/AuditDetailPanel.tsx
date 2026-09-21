import { X } from 'lucide-react'
import {
  formatDetalhesAuditoria,
  labelAcaoAuditoria,
  labelExecutorAuditoria,
} from '@/lib/auditLabels'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatAuditDate, formatDetalhesCompletos } from './auditUtils'
import type { AuditLogRow } from './types'

interface AuditDetailPanelProps {
  log: AuditLogRow | null
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/60 py-3 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-text break-words">{value || '—'}</dd>
    </div>
  )
}

export function AuditDetailPanel({ log, onClose }: AuditDetailPanelProps) {
  if (!log) return null

  const detalhesList = formatDetalhesCompletos(log.detalhes)

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-primary-dark/30 backdrop-blur-[1px] lg:bg-transparent lg:backdrop-blur-none"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-white shadow-[var(--shadow-card)] animate-slide-in-right"
        aria-label="Detalhes do registro de auditoria"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Resumo</p>
            <h2 className="mt-0.5 truncate text-base font-semibold text-text">
              {labelAcaoAuditoria(log.acao)}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar painel">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          <div className="mb-4">
            <Badge variant="primary">{labelAcaoAuditoria(log.acao)}</Badge>
          </div>

          <dl>
            <DetailRow label="Data e hora" value={formatAuditDate(log.created_at, 'long')} />
            <DetailRow
              label="Quem executou"
              value={labelExecutorAuditoria(log.usuario, log.acao)}
            />
            {log.usuario ? (
              <DetailRow label="Nome de usuário" value={`@${log.usuario.nome_usuario}`} />
            ) : null}
            <DetailRow label="Entidade" value={log.entidade ?? '—'} />
            <DetailRow label="ID da entidade" value={log.entidade_id ?? '—'} />
            <DetailRow label="Resumo" value={formatDetalhesAuditoria(log.detalhes)} />
          </dl>

          {detalhesList.length > 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-surface-warm/50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Detalhes completos
              </h3>
              <dl className="mt-2">
                {detalhesList.map((item) => (
                  <DetailRow key={item.key} label={item.label} value={item.value} />
                ))}
              </dl>
            </div>
          ) : null}

          <div className="mt-4 rounded-xl border border-dashed border-border/80 bg-white p-3">
            <p className="text-xs text-text-muted">
              ID do registro: <span className="font-mono text-text">{log.id.slice(0, 8)}…</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
