import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { BookProgressVisual } from '@/features/app/BookProgressVisual'
import { ProgressLevelBar } from '@/features/app/ProgressLevelBar'
import {
  fraseCapitulo,
  mensagemAcolhedora,
  paletaLivroCinematico,
  resumoLeituras,
} from '@/features/app/progressCopy'
import { useBookProgressAnimation } from '@/features/app/useBookProgressAnimation'
import { useAlunoProgress } from '@/features/app/useAlunoProgress'
import { cn } from '@/lib/utils'

interface HomeProgressCardProps {
  userId: string | undefined
}

export function HomeProgressCard({ userId }: HomeProgressCardProps) {
  const { data: progress, isLoading } = useAlunoProgress(userId)
  const { pageProgress, justLeveledUp } = useBookProgressAnimation(progress)

  if (isLoading) {
    return (
      <div className="leitura-jornada leitura-jornada--loading animate-pulse" aria-hidden>
        <div className="h-[4.5rem] w-full max-w-[5.5rem] rounded-lg bg-primary-light/40" />
        <div className="mt-3 h-2.5 w-full rounded-full bg-primary-light/35" />
      </div>
    )
  }

  if (!progress) return null

  const paleta = paletaLivroCinematico(progress.nivel, progress.progressoNivelPct)

  const cardStyle = {
    '--jornada-ambient': paleta.ambiente,
    '--jornada-glow': paleta.glow,
    '--jornada-accent': paleta.accent,
    '--jornada-progress': paleta.barra,
  } as CSSProperties

  return (
    <div className="home-progress-wrap">
      <p className="home-hero-section-label mb-2">Sua jornada de leitura</p>
      <Link
        to="/app/progresso"
        className={cn(
          'leitura-jornada leitura-jornada--interactive group block no-underline',
          justLeveledUp && 'leitura-jornada--celebrate',
        )}
        style={cardStyle}
        aria-label={`${fraseCapitulo(progress.nivel)}. ${progress.xp} XP. ${resumoLeituras(progress)}.`}
      >
        <div className="leitura-jornada__inner">
          <div className="leitura-jornada__book-col">
            <BookProgressVisual
              pageProgress={pageProgress}
              nivel={progress.nivel}
              marcadorCor={paleta.marcador}
              paleta={paleta}
              justLeveledUp={justLeveledUp}
              size="md"
              cinematic
            />
          </div>

          <div className="leitura-jornada__text min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="leitura-jornada__capitulo-chip">{fraseCapitulo(progress.nivel)}</span>
              <span className="leitura-jornada__xp-chip">{progress.xp} XP</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-text-muted">{mensagemAcolhedora(progress)}</p>

            <ProgressLevelBar
              className="mt-3"
              compact
              pct={progress.progressoNivelPct}
              nivel={progress.nivel}
              barra={paleta.barra}
              barraTrack={paleta.barraTrack}
              xpTotal={progress.xp}
              xpParaProximo={progress.xpParaProximoNivel}
              nivelMaximo={progress.nivelMaximo}
            />

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <p className="text-[10px] text-text-muted/90">{resumoLeituras(progress)}</p>
              <span className="leitura-jornada__cta shrink-0">Ver jornada</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
