import { Activity, BookOpen, KeyRound, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import type { AuditStats } from './types'

interface AuditSummaryCardsProps {
  stats: AuditStats | undefined
  pendingSenha: number
  isLoading: boolean
}

const CARDS = [
  {
    key: 'hoje',
    label: 'Eventos hoje',
    icon: Activity,
    tint: 'bg-primary-light/80 border-primary/10',
    iconTint: 'text-primary',
  },
  {
    key: 'senha',
    label: 'Pedidos senha pendentes',
    icon: KeyRound,
    tint: 'bg-accent-light/70 border-accent/20',
    iconTint: 'text-accent-hover',
  },
  {
    key: 'usuarios',
    label: 'Usuários criados',
    icon: Users,
    tint: 'bg-primary-light/60 border-primary/10',
    iconTint: 'text-primary',
  },
  {
    key: 'conteudos',
    label: 'Conteúdos alterados',
    icon: BookOpen,
    tint: 'bg-accent-light/50 border-accent/15',
    iconTint: 'text-accent-hover',
  },
] as const

function resolveValue(
  key: (typeof CARDS)[number]['key'],
  stats: AuditStats | undefined,
  pendingSenha: number,
): number {
  if (!stats) return 0
  switch (key) {
    case 'hoje':
      return stats.eventosHoje
    case 'senha':
      return pendingSenha
    case 'usuarios':
      return stats.usuariosCriados
    case 'conteudos':
      return stats.conteudosAlterados
  }
}

export function AuditSummaryCards({ stats, pendingSenha, isLoading }: AuditSummaryCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon
        const value = resolveValue(card.key, stats, pendingSenha)

        return (
          <Card key={card.key} className={card.tint}>
            <CardContent className="flex items-start gap-3 p-4 sm:p-5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 ${card.iconTint}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-muted sm:text-sm">{card.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-7 w-12" />
                ) : (
                  <p className="mt-0.5 text-2xl font-bold tabular-nums text-text">{value}</p>
                )}
                {card.key === 'hoje' && stats && !isLoading ? (
                  <p className="mt-0.5 text-xs text-text-muted">
                    {stats.eventosSemana} na última semana
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
