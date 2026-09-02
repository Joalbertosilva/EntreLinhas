import type { StatusLeitura } from '@tcc-sistema/types'
import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageTurnToast } from '@/features/app/PageTurnToast'
import { fetchAlunoProgress } from '@/features/app/progressCopy'
import type { AlunoProgressStats } from '@/features/app/alunoProgress'
import { playPageTurnSound } from '@/features/app/playPageTurnSound'

export const PAGE_TURN_EVENT = 'entrelinhas:page-turn'

export interface PageTurnDetail {
  leveledUp: boolean
  xpGained: number
  nivel: number
  status: StatusLeitura
}

export function dispatchPageTurn(detail: PageTurnDetail) {
  window.dispatchEvent(new CustomEvent(PAGE_TURN_EVENT, { detail }))
}

export function showPageTurnCelebration(detail: PageTurnDetail) {
  playPageTurnSound()
  dispatchPageTurn(detail)

  const duration = detail.leveledUp ? 6200 : detail.status === 'concluido' ? 4800 : 3200

  toast.custom(
    (id) => (
      <PageTurnToast
        leveledUp={detail.leveledUp}
        xpGained={detail.xpGained}
        nivel={detail.nivel}
        status={detail.status}
        onClose={() => toast.dismiss(id)}
      />
    ),
    {
      duration,
      position: 'top-right',
      className: 'page-turn-toast-host',
      style: { marginTop: '0.25rem' },
    },
  )
}

/** Compara progresso antes/depois da leitura e dispara celebração */
export async function celebrateReadingProgressChange(
  queryClient: QueryClient,
  userId: string,
  status: StatusLeitura,
  prevSnapshot?: AlunoProgressStats,
) {
  if (status !== 'concluido' && status !== 'em_andamento') return

  const prev =
    prevSnapshot ?? queryClient.getQueryData<AlunoProgressStats>(['aluno-progress', userId])

  let next: AlunoProgressStats
  try {
    next = await queryClient.fetchQuery({
      queryKey: ['aluno-progress', userId],
      queryFn: () => fetchAlunoProgress(userId),
    })
  } catch {
    return
  }

  const xpGained = Math.max(0, next.xp - (prev?.xp ?? 0))
  const leveledUp = Boolean(prev && next.nivel > prev.nivel)

  if (xpGained <= 0 && !leveledUp) return

  showPageTurnCelebration({
    leveledUp,
    xpGained,
    nivel: next.nivel,
    status,
  })
}
