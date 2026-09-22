import type { QueryClient } from '@tanstack/react-query'
import type { StatusLeitura } from '@tcc-sistema/types'
import { fetchAlunoProgress } from '@/features/progress/fetchAlunoProgress'
import type { AlunoProgressStats } from '@/lib/alunoProgress'

export interface PageTurnDetail {
  leveledUp: boolean
  xpGained: number
  nivel: number
  progressoNivelPct: number
  status: StatusLeitura
}

type CelebrationHandler = (detail: PageTurnDetail) => void

let celebrationHandler: CelebrationHandler | null = null

export function registerProgressCelebrationHandler(handler: CelebrationHandler | null) {
  celebrationHandler = handler
}

export function showPageTurnCelebration(detail: PageTurnDetail) {
  celebrationHandler?.(detail)
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
    progressoNivelPct: next.progressoNivelPct,
    status,
  })
}
