import {
  formatDetalhesAuditoria,
  labelAcaoAuditoria,
  labelExecutorAuditoria,
} from '@/lib/auditLabels'
import { Badge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { cn } from '@/lib/utils'
import { formatAuditDate } from './auditUtils'
import type { AuditLogRow } from './types'

interface AuditListViewProps {
  logs: AuditLogRow[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (log: AuditLogRow) => void
  emptyMessage: string
}

export function AuditListView({
  logs,
  isLoading,
  selectedId,
  onSelect,
  emptyMessage,
}: AuditListViewProps) {
  if (isLoading) return <TableSkeleton rows={8} />

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Data</TableHead>
          <TableHead>Quem executou</TableHead>
          <TableHead>Ação</TableHead>
          <TableHead className="hidden lg:table-cell">Detalhes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableEmpty colSpan={4} message={emptyMessage} />
        ) : (
          logs.map((log) => (
            <TableRow
              key={log.id}
              className={cn(
                'cursor-pointer',
                selectedId === log.id && 'bg-primary-light/40',
              )}
              onClick={() => onSelect(log)}
            >
              <TableCell className="whitespace-nowrap text-sm text-text-muted">
                {formatAuditDate(log.created_at)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-text">
                    {labelExecutorAuditoria(log.usuario, log.acao)}
                  </p>
                  {log.usuario ? (
                    <p className="text-xs text-text-muted">{log.usuario.nome_usuario}</p>
                  ) : log.acao === 'senha.solicitacao' ? (
                    <p className="text-xs text-text-muted">Pedido institucional</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant="primary">{labelAcaoAuditoria(log.acao)}</Badge>
                  {log.entidade ? (
                    <p className="text-xs text-text-muted">{log.entidade}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="hidden max-w-xs text-sm text-text-muted lg:table-cell">
                {formatDetalhesAuditoria(log.detalhes)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
