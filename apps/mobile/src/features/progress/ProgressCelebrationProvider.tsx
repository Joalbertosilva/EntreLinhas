import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { PageTurnCelebrationModal } from '@/features/progress/PageTurnCelebrationModal'
import {
  registerProgressCelebrationHandler,
  type PageTurnDetail,
} from '@/features/progress/progressCelebration'

export function ProgressCelebrationProvider({ children }: { children: ReactNode }) {
  const [celebration, setCelebration] = useState<PageTurnDetail | null>(null)

  const showCelebration = useCallback((detail: PageTurnDetail) => {
    setCelebration(detail)
    const duration = detail.leveledUp ? 6200 : detail.status === 'concluido' ? 4800 : 3200
    setTimeout(() => setCelebration(null), duration)
  }, [])

  useEffect(() => {
    registerProgressCelebrationHandler(showCelebration)
    return () => registerProgressCelebrationHandler(null)
  }, [showCelebration])

  return (
    <>
      {children}
      <PageTurnCelebrationModal detail={celebration} onClose={() => setCelebration(null)} />
    </>
  )
}
