import { ArrowDown, GitBranch } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { labelAcaoAuditoria } from '@/lib/auditLabels'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { countLogsByAcao } from './auditUtils'
import {
  getSystemFlow,
  SYSTEM_FLOWS,
  type FlowStep,
  type SystemFlowDefinition,
  type SystemFlowId,
} from './systemFlows'
import type { AuditLogRow } from './types'

const ACTOR_STYLES = {
  aluno: {
    lane: 'border-primary/25 bg-primary-light/35',
    badge: 'bg-primary text-white',
    dot: 'bg-primary',
    label: 'Aluno',
  },
  sistema: {
    lane: 'border-accent/30 bg-accent-light/40',
    badge: 'bg-accent text-brand-navy',
    dot: 'bg-accent',
    label: 'Sistema',
  },
  staff: {
    lane: 'border-viva/40 bg-viva-soft/50',
    badge: 'bg-viva-deep text-white',
    dot: 'bg-viva-deep',
    label: 'Professor / Admin',
  },
} as const

function FlowConnector({ variant = 'straight' }: { variant?: 'straight' | 'split' }) {
  if (variant === 'split') {
    return (
      <div className="relative flex h-16 w-full max-w-2xl items-start justify-center" aria-hidden>
        <svg className="h-full w-full max-w-md" viewBox="0 0 320 64" fill="none">
          <path
            d="M160 0 L160 24 L80 24 L80 64"
            stroke="#1c756a"
            strokeWidth="2"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          <path
            d="M160 0 L160 24 L240 24 L240 64"
            stroke="#1c756a"
            strokeWidth="2"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          <polygon points="76,58 80,64 84,58" fill="#1c756a" fillOpacity="0.5" />
          <polygon points="236,58 240,64 244,58" fill="#1c756a" fillOpacity="0.5" />
        </svg>
        <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-text-muted ring-1 ring-border">
          caminhos possíveis
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-1" aria-hidden>
      <div className="h-6 w-0.5 bg-gradient-to-b from-primary/40 to-primary/20" />
      <ArrowDown className="h-4 w-4 text-primary/45" strokeWidth={2.5} />
    </div>
  )
}

function FlowStepCard({
  step,
  index,
  count,
  isActive,
  layout = 'horizontal',
  onSelect,
}: {
  step: FlowStep
  index: number
  count: number
  isActive: boolean
  layout?: 'horizontal' | 'vertical'
  onSelect: () => void
}) {
  const Icon = step.icon
  const styles = ACTOR_STYLES[step.actor]
  const primaryAcao = step.acoes[0]
  const isVertical = layout === 'vertical'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full min-w-0 overflow-hidden rounded-2xl border-2 p-4 text-left transition-all sm:p-5',
        styles.lane,
        isActive
          ? 'border-primary shadow-[var(--shadow-glow)] ring-2 ring-primary/15'
          : 'hover:border-primary/35 hover:shadow-[var(--shadow-soft)]',
        step.usePending && count > 0 && !isActive && 'border-accent/50',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-white text-xs font-bold text-primary shadow-sm">
          {index + 1}
        </span>
        <Badge variant={count > 0 ? 'primary' : 'outline'} className="shrink-0">
          {step.usePending
            ? `${count} pendente${count !== 1 ? 's' : ''}`
            : `${count} registro${count !== 1 ? 's' : ''}`}
        </Badge>
      </div>

      <div
        className={cn(
          'min-w-0',
          isVertical ? 'flex flex-col gap-3' : 'flex items-start gap-3',
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm',
            isActive ? styles.badge : 'bg-white text-text',
            isVertical && 'self-start',
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <span
            className={cn(
              'inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide',
              styles.badge,
            )}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/90" />
            <span className="break-words">{step.actorLabel}</span>
          </span>

          <h4 className="mt-2 break-words text-base font-semibold leading-snug text-text">
            {step.title}
          </h4>
          <p className="mt-1 break-words text-base leading-relaxed text-text-muted">
            {step.description}
          </p>

          {primaryAcao ? (
            <p className="mt-3 block w-full break-all rounded-md bg-white/70 px-2 py-1.5 font-mono text-xs leading-relaxed text-text-muted">
              {primaryAcao}
              {step.acoes.length > 1 ? ` (+${step.acoes.length - 1})` : ''}
            </p>
          ) : null}

          {step.link ? (
            <Link
              to={step.link.to}
              className="mt-3 inline-flex max-w-full items-center gap-1 break-words text-sm font-semibold text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {step.link.label} →
            </Link>
          ) : null}
        </div>
      </div>
    </button>
  )
}

function FlowDiagram({
  flow,
  logs,
  pendingSenha,
  activeStepId,
  onStepSelect,
}: {
  flow: SystemFlowDefinition
  logs: AuditLogRow[]
  pendingSenha: number
  activeStepId: string | null
  onStepSelect: (stepId: string | null, acoes: string[]) => void
}) {
  const mainSteps = flow.steps.filter((s) => s.branch === 'main')
  const forkSteps = flow.steps.filter((s) => s.branch?.startsWith('fork'))
  const hasFork = forkSteps.length > 0

  const getCount = (step: FlowStep) =>
    step.usePending ? pendingSenha : countLogsByAcao(logs, step.acoes)

  const handleSelect = (step: FlowStep) => {
    const isActive = activeStepId === step.id
    onStepSelect(isActive ? null : step.id, step.acoes.length > 0 ? step.acoes : [])
  }

  return (
    <>
      <div className="mx-auto max-w-xl">
        {mainSteps.map((step, index) => (
          <div key={step.id}>
            <FlowStepCard
              step={step}
              index={index}
              count={getCount(step)}
              isActive={activeStepId === step.id}
              onSelect={() => handleSelect(step)}
            />
            {index < mainSteps.length - 1 ? <FlowConnector /> : null}
          </div>
        ))}

        {hasFork ? (
          <FlowConnector variant={forkSteps.length === 2 ? 'split' : 'straight'} />
        ) : null}
      </div>

      {hasFork ? (
        <div
          className={cn(
            'grid w-full gap-4',
            forkSteps.length >= 3
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
              : forkSteps.length === 2
                ? 'mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2'
                : 'mx-auto max-w-xl',
          )}
        >
          {forkSteps.map((step, i) => (
            <FlowStepCard
              key={step.id}
              step={step}
              index={mainSteps.length + i}
              count={getCount(step)}
              isActive={activeStepId === step.id}
              layout="vertical"
              onSelect={() => handleSelect(step)}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-border/80 bg-surface-warm/40 p-4 sm:p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Ações registradas neste fluxo
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {flow.legendAcoes.map((acao) => (
            <li
              key={acao}
              className="min-w-0 rounded-lg border border-border/60 bg-white px-3 py-2 text-base text-text-muted"
            >
              <span className="block break-all font-mono text-xs text-text">{acao}</span>
              <span className="mt-0.5 block break-words">{labelAcaoAuditoria(acao)}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

interface AuditSystemFlowsDiagramProps {
  logs: AuditLogRow[]
  pendingSenha: number
  selectedFlowId: SystemFlowId
  onFlowChange: (flowId: SystemFlowId) => void
  activeStepId: string | null
  onStepSelect: (stepId: string | null, acoes: string[], flowId: SystemFlowId) => void
}

export function AuditSystemFlowsDiagram({
  logs,
  pendingSenha,
  selectedFlowId,
  onFlowChange,
  activeStepId,
  onStepSelect,
}: AuditSystemFlowsDiagramProps) {
  const flow = getSystemFlow(selectedFlowId)
  const FlowIcon = flow.icon

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-light/50 via-white to-accent-light/30">
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <GitBranch className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text">Fluxos do sistema</h3>
            <p className="mt-1 text-base text-text-muted">
              Escolha o processo institucional e clique em uma etapa para filtrar os registros na{' '}
              <strong className="font-semibold text-text">Lista</strong> ou{' '}
              <strong className="font-semibold text-text">Linha do tempo</strong>.
            </p>
          </div>
        </div>

        <div className="border-t border-primary/10 bg-white/60 px-4 py-4 sm:px-5">
          <p className="mb-2 text-sm font-medium text-text-muted">Qual fluxo visualizar?</p>
          <div className="flex flex-wrap gap-2">
            {SYSTEM_FLOWS.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={selectedFlowId === item.id ? 'primary' : 'outline'}
                  className={cn('rounded-full', selectedFlowId !== item.id && 'bg-white')}
                  onClick={() => onFlowChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-primary/10 bg-white/50 px-4 py-3 sm:px-5">
          {Object.entries(ACTOR_STYLES).map(([key, style]) => (
            <span key={key} className="inline-flex items-center gap-1.5 text-sm text-text-muted">
              <span className={cn('h-2.5 w-2.5 rounded-full', style.dot)} />
              {style.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-white p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
          <FlowIcon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h4 className="text-base font-semibold text-text">{flow.label}</h4>
          <p className="mt-0.5 text-base text-text-muted">{flow.description}</p>
        </div>
      </div>

      <FlowDiagram
        flow={flow}
        logs={logs}
        pendingSenha={pendingSenha}
        activeStepId={activeStepId}
        onStepSelect={(stepId, acoes) => onStepSelect(stepId, acoes, selectedFlowId)}
      />

      {activeStepId ? (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => onStepSelect(null, [], selectedFlowId)}
          >
            Limpar filtro do fluxo
          </Button>
        </div>
      ) : null}
    </div>
  )
}
