import type { CSSProperties } from 'react'
import type { StatusLeitura } from '@tcc-sistema/types'
import { X } from 'lucide-react'
import { BookProgressVisual } from '@/features/app/BookProgressVisual'
import { paletaLivroCinematico } from '@/features/app/progressCopy'

interface PageTurnToastProps {
  leveledUp: boolean
  xpGained: number
  nivel: number
  status: StatusLeitura
  onClose: () => void
}

export function PageTurnToast({ leveledUp, xpGained, nivel, status, onClose }: PageTurnToastProps) {
  const paleta = paletaLivroCinematico(nivel, leveledUp ? 100 : 72)

  const title = leveledUp
    ? `Capítulo ${nivel}`
    : status === 'concluido'
      ? 'Obra concluída'
      : 'Leitura iniciada'

  const subtitle = leveledUp
    ? 'Novo capítulo desbloqueado'
    : status === 'concluido'
      ? 'Mais uma obra na jornada'
      : 'Bom começo'

  return (
    <div
      className="page-turn-toast page-turn-toast--solid"
      style={
        {
          '--toast-ambient': paleta.ambiente,
          '--toast-accent': paleta.accent,
        } as CSSProperties
      }
      role="status"
    >
      <button
        type="button"
        className="page-turn-toast__close"
        onClick={onClose}
        aria-label="Fechar"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="page-turn-toast__book">
        <BookProgressVisual
          pageProgress={leveledUp ? 1 : 0.88}
          nivel={nivel}
          marcadorCor={paleta.marcador}
          paleta={paleta}
          justLeveledUp={leveledUp}
          size="md"
          cinematic
        />
      </div>

      <div className="page-turn-toast__text">
        <p className="page-turn-toast__title">{title}</p>
        <p className="page-turn-toast__subtitle">{subtitle}</p>
        {xpGained > 0 && <p className="page-turn-toast__xp">+{xpGained} XP</p>}
      </div>
    </div>
  )
}
