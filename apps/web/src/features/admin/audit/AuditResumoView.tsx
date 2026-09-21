import { AuditCharts } from './AuditCharts'
import { AuditSummaryCards } from './AuditSummaryCards'
import type { AuditActivityConfig, AuditLogRow, AuditStats } from './types'

interface AuditResumoViewProps {
  logs: AuditLogRow[]
  stats: AuditStats | undefined
  pendingSenha: number
  activityConfig: AuditActivityConfig
  onActivityConfigChange: (config: AuditActivityConfig) => void
  isLoading: boolean
}

export function AuditResumoView({
  logs,
  stats,
  pendingSenha,
  activityConfig,
  onActivityConfigChange,
  isLoading,
}: AuditResumoViewProps) {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-xl border border-primary/10 bg-primary-light/25 p-4">
        <p className="text-base text-text-muted">
          Visão estatística opcional — números e gráficos do período escolhido. O histórico detalhado
          fica nas abas <strong className="font-semibold text-text">Lista</strong> e{' '}
          <strong className="font-semibold text-text">Linha do tempo</strong>.
        </p>
      </div>

      <AuditSummaryCards stats={stats} pendingSenha={pendingSenha} isLoading={isLoading} />

      <AuditCharts
        logs={logs}
        config={activityConfig}
        onConfigChange={onActivityConfigChange}
        isLoading={isLoading}
      />
    </div>
  )
}
