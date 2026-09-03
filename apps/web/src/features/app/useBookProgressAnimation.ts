import { useEffect, useRef, useState } from 'react'
import type { AlunoProgressStats } from '@/features/app/alunoProgress'
import { PAGE_TURN_EVENT, type PageTurnDetail } from '@/features/app/progressCelebration'

const DURATION_XP = 2800
const DURATION_LEVEL_UP = 4200

interface UseBookProgressAnimationResult {
  pageProgress: number
  displayPct: number
  justLeveledUp: boolean
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function animatePct(
  from: number,
  to: number,
  durationMs: number,
  onFrame: (value: number) => void,
): () => void {
  const start = performance.now()
  let frameId = 0

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs)
    onFrame(from + (to - from) * easeOutCubic(t))
    if (t < 1) frameId = window.requestAnimationFrame(tick)
  }

  frameId = window.requestAnimationFrame(tick)
  return () => window.cancelAnimationFrame(frameId)
}

export function useBookProgressAnimation(
  progress: AlunoProgressStats | undefined,
): UseBookProgressAnimationResult {
  const [justLeveledUp, setJustLeveledUp] = useState(false)
  const [displayPct, setDisplayPct] = useState(0)
  const displayRef = useRef(0)
  const cancelAnimRef = useRef<(() => void) | null>(null)
  const mountedRef = useRef(false)

  const runAnimation = (target: number, leveledUp: boolean) => {
    cancelAnimRef.current?.()
    const duration = leveledUp ? DURATION_LEVEL_UP : DURATION_XP

    if (leveledUp) {
      setJustLeveledUp(true)
      displayRef.current = 0
      setDisplayPct(0)
    }

    const startFrom = leveledUp ? 0 : displayRef.current
    const startDelay = leveledUp ? 420 : 0

    const begin = () => {
      cancelAnimRef.current = animatePct(startFrom, target, duration, (value) => {
        displayRef.current = value
        setDisplayPct(Math.round(value))
      })
    }

    if (startDelay > 0) {
      const t = window.setTimeout(begin, startDelay)
      window.setTimeout(() => setJustLeveledUp(false), startDelay + duration + 200)
      cancelAnimRef.current = () => window.clearTimeout(t)
      return
    }

    begin()
    window.setTimeout(() => setJustLeveledUp(false), duration + 200)
  }

  useEffect(() => {
    if (!progress) return

    if (!mountedRef.current) {
      mountedRef.current = true
      displayRef.current = progress.progressoNivelPct
      setDisplayPct(Math.round(progress.progressoNivelPct))
      return
    }
  }, [progress?.progressoNivelPct, progress?.nivel, progress?.xp])

  useEffect(() => {
    const onPageTurn = (e: Event) => {
      const detail = (e as CustomEvent<PageTurnDetail>).detail
      if (!detail) return

      if (detail.leveledUp) {
        runAnimation(detail.progressoNivelPct, true)
      } else if (detail.status === 'concluido' || detail.status === 'em_andamento') {
        runAnimation(detail.progressoNivelPct, false)
      }
    }

    window.addEventListener(PAGE_TURN_EVENT, onPageTurn)
    return () => window.removeEventListener(PAGE_TURN_EVENT, onPageTurn)
  }, [])

  return {
    pageProgress: displayPct / 100,
    displayPct,
    justLeveledUp,
  }
}
