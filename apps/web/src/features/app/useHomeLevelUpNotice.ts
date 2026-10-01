import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { rotuloNivel } from '@/features/app/alunoProgress'

const storageKey = (userId: string) => `entrelinhas:last-nivel:${userId}`

/** Detecta subida de nível ao voltar à home e exibe aviso. */
export function useHomeLevelUpNotice(
  userId: string | undefined,
  nivel: number | undefined,
  nivelMaximo: boolean | undefined,
) {
  const [banner, setBanner] = useState(false)

  useEffect(() => {
    if (!userId || nivel == null) return

    const key = storageKey(userId)
    const stored = sessionStorage.getItem(key)

    if (stored !== null) {
      const prev = Number.parseInt(stored, 10)
      if (!Number.isNaN(prev) && nivel > prev) {
        setBanner(true)
        const label = rotuloNivel(nivel, Boolean(nivelMaximo))
        toast.success(`Você subiu de nível! ${label}.`, { duration: 5200 })
        const hide = window.setTimeout(() => setBanner(false), 6000)
        sessionStorage.setItem(key, String(nivel))
        return () => window.clearTimeout(hide)
      }
    }

    sessionStorage.setItem(key, String(nivel))
  }, [userId, nivel, nivelMaximo])

  return banner
}
