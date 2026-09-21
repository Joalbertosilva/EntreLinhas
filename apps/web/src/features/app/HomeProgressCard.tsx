import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { BookProgressVisual } from '@/features/app/BookProgressVisual'
import { ProgressLevelBar } from '@/features/app/ProgressLevelBar'
import { rotuloNivel, tituloJornada } from '@/features/app/alunoProgress'
import { paletaLivroCinematico, resumoLeituras } from '@/features/app/progressCopy'
import { useBookProgressAnimation } from '@/features/app/useBookProgressAnimation'
import { useAlunoProgress } from '@/features/app/useAlunoProgress'
import { cn } from '@/lib/utils'

interface HomeProgressCardProps {
  userId: string | undefined
}

export function HomeProgressCard({ userId }: HomeProgressCardProps) {
  const { data: progress, isLoading } = useAlunoProgress(userId)
  const { pageProgress, displayPct, justLeveledUp } = useBookProgressAnimation(progress)

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
  const nivelRotulo = rotuloNivel(progress.nivel, progress.nivelMaximo)
  const faixaRotulo = tituloJornada(progress.nivel)
  const resumo = resumoLeituras(progress)

  const cardStyle = {
    '--jornada-ambient': paleta.ambiente,
    '--jornada-glow': paleta.glow,
    '--jornada-accent': paleta.accent,
    '--jornada-progress': paleta.barra,
  } as CSSProperties

  return (
    <div className="home-progress-wrap">
      <p className="home-hero-section-label mb-2">Nível de leitor</p>
      <Link
        to="/app/progresso"
        className={cn(
          'leitura-jornada leitura-jornada--interactive leitura-jornada--solid group block no-underline',
          justLeveledUp && 'leitura-jornada--celebrate',
        )}
        style={cardStyle}
        aria-label={`${nivelRotulo}. ${faixaRotulo}. ${progress.xp} XP. ${displayPct}% deste capítulo.`}
      >
        <div className="leitura-jornada__inner">
          <div className="leitura-jornada__book-col leitura-jornada__book-col--solid">
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
            <p className="leitura-jornada__faixa-titulo">{nivelRotulo}</p>
            <p className="leitura-jornada__faixa-subtitulo">{faixaRotulo}</p>
            <p className="leitura-jornada__xp-destaque">{progress.xp} XP</p>

            <ProgressLevelBar
              className="mt-3"
              compact
              pct={displayPct}
              nivel={progress.nivel}
              barra={paleta.barra}
              barraTrack={paleta.barraTrack}
              xpTotal={progress.xp}
              xpParaProximo={progress.xpParaProximoNivel}
              nivelMaximo={progress.nivelMaximo}
              onSolidBg
              hideFreshHint
              hideXpTotal
            />

            {resumo !== 'Nenhuma leitura registrada ainda' && (
              <p className="leitura-jornada__meta mt-2">{resumo}</p>
            )}

            <div className="mt-3 flex items-center justify-end">
              <span className="leitura-jornada__cta shrink-0">Ver jornada</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
