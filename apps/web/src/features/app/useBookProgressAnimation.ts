import { useEffect, useRef, useState } from 'react'
import type { AlunoProgressStats } from '@/features/app/alunoProgress'
import { PAGE_TURN_EVENT, type PageTurnDetail } from '@/features/app/progressCelebration'

const STORAGE_KEY = 'entrelinhas-ultimo-nivel'

interface UseBookProgressAnimationResult {
  pageProgress: number
  justLeveledUp: boolean
}

export function useBookProgressAnimation(
  progress: AlunoProgressStats | undefined,
): UseBookProgressAnimationResult {
  const [justLeveledUp, setJustLeveledUp] = useState(false)
  const [displayPct, setDisplayPct] = useState(0)
  const animatingRef = useRef(false)

  const runLevelUpPulse = () => {
    if (animatingRef.current) return
    animatingRef.current = true
    setJustLeveledUp(true)

    window.setTimeout(() => {
      setDisplayPct(progress?.progressoNivelPct ?? 0)
      setJustLeveledUp(false)
      animatingRef.current = false
    }, 1800)
  }

  useEffect(() => {
    if (!progress) return

    const stored = sessionStorage.getItem(STORAGE_KEY)
    const prevNivel = stored ? Number(stored) : progress.nivel

    if (prevNivel < progress.nivel) {
      runLevelUpPulse()
      sessionStorage.setItem(STORAGE_KEY, String(progress.nivel))
      return
    }

    sessionStorage.setItem(STORAGE_KEY, String(progress.nivel))

    if (!animatingRef.current) {
      const frame = window.requestAnimationFrame(() => {
        setDisplayPct(progress.progressoNivelPct)
      })
      return () => window.cancelAnimationFrame(frame)
    }
  }, [progress])

  useEffect(() => {
    const onPageTurn = (e: Event) => {
      const detail = (e as CustomEvent<PageTurnDetail>).detail
      if (detail?.leveledUp) runLevelUpPulse()
      else if (detail?.status === 'concluido') {
        setDisplayPct(progress?.progressoNivelPct ?? 0)
      }
    }

    window.addEventListener(PAGE_TURN_EVENT, onPageTurn)
    return () => window.removeEventListener(PAGE_TURN_EVENT, onPageTurn)
  }, [progress?.progressoNivelPct])

  return { pageProgress: displayPct / 100, justLeveledUp }
}
