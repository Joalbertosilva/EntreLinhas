import type { CSSProperties } from 'react'
import type { PaletaLivro } from '@/features/app/progressCopy'
import { cn } from '@/lib/utils'

interface BookProgressVisualProps {
  pageProgress: number
  nivel: number
  marcadorCor: string
  paleta?: PaletaLivro
  justLeveledUp?: boolean
  size?: 'sm' | 'md' | 'lg'
  cinematic?: boolean
  className?: string
}

export function BookProgressVisual({
  pageProgress,
  nivel,
  marcadorCor,
  paleta,
  justLeveledUp = false,
  size = 'sm',
  cinematic = false,
  className,
}: BookProgressVisualProps) {
  const clamped = Math.max(0, Math.min(1, pageProgress))
  const paginasLidas = Math.min(8, Math.max(0, nivel - 1))
  const viradaGrau = clamped * 168

  const style = {
    '--book-marker': marcadorCor,
    '--book-tint': paleta?.pagina ?? 'rgb(0 0 138 / 0.2)',
    '--book-tint-deep': paleta?.paginaEscura ?? 'rgb(0 0 138 / 0.32)',
    '--book-glow': paleta?.glow ?? 'rgb(0 0 138 / 0.28)',
    '--page-turn': `${viradaGrau}deg`,
    '--book-fill': clamped,
  } as CSSProperties

  return (
    <div
      className={cn(
        'book-progress',
        size === 'md' && 'book-progress--md',
        size === 'lg' && 'book-progress--lg',
        cinematic && 'book-progress--cinematic',
        justLeveledUp && 'book-progress--celebrate',
        className,
      )}
      style={style}
      aria-hidden
    >
      <div className="book-progress__ambient" />
      <div className="book-progress__shadow" />

      <div className="book-progress__volume">
        <span className="book-progress__spine" />
        <div className="book-progress__stack">
          {Array.from({ length: paginasLidas }).map((_, i) => (
            <span
              key={i}
              className="book-progress__stack-leaf"
              style={{ '--stack-i': i } as CSSProperties}
            />
          ))}
        </div>

        <div className="book-progress__spread">
          <div className="book-progress__page book-progress__page--left">
            <span className="book-progress__ink-wash" />
            <span className="book-progress__line" />
            <span className="book-progress__line book-progress__line--short" />
            <span className="book-progress__line" />
            <span className="book-progress__line book-progress__line--medium" />
          </div>

          <div className="book-progress__gutter" />

          <div className="book-progress__page book-progress__page--right">
            <span className="book-progress__line" />
            <span className="book-progress__line book-progress__line--medium" />
            <span className="book-progress__line book-progress__line--short" />
            <span className="book-progress__line" />
          </div>

          <div className="book-progress__flip">
            <div className="book-progress__flip-front">
              <span className="book-progress__line" />
              <span className="book-progress__line book-progress__line--medium" />
              <span className="book-progress__line book-progress__line--short" />
            </div>
            <div className="book-progress__flip-back">
              <span className="book-progress__line book-progress__line--faint" />
              <span className="book-progress__line" />
              <span className="book-progress__line book-progress__line--medium" />
            </div>
          </div>
        </div>

        <span className="book-progress__marker" />
      </div>

      {justLeveledUp && <p className="book-progress__whisper">Nova página</p>}
    </div>
  )
}
