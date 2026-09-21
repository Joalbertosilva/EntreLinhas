import { FilterX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getFlowStepLabel, getSystemFlow, type SystemFlowId } from './systemFlows'

interface AuditFlowFilterBannerProps {
  flowId: SystemFlowId
  stepId: string | null
  acoesFilter: string[] | null
  onClear: () => void
}

export function AuditFlowFilterBanner({
  flowId,
  stepId,
  acoesFilter,
  onClear,
}: AuditFlowFilterBannerProps) {
  const flow = getSystemFlow(flowId)
  const stepLabel = stepId ? getFlowStepLabel(flowId, stepId) : null

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary-light/50 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-text">Filtro do fluxo ativo</p>
        <p className="mt-0.5 text-base text-text-muted">
          <span className="font-medium text-text">{flow.label}</span>
          {stepLabel ? (
            <>
              {' '}
              → <span className="font-medium text-text">{stepLabel}</span>
            </>
          ) : null}
          {acoesFilter && acoesFilter.length > 0 ? (
            <span className="mt-1 block break-words font-mono text-sm">
              {acoesFilter.join(', ')}
            </span>
          ) : null}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 border-primary/30 bg-white hover:bg-white"
        onClick={onClear}
      >
        <FilterX className="h-4 w-4" />
        Limpar filtro
      </Button>
    </div>
  )
}
