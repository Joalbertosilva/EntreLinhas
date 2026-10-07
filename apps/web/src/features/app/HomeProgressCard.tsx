import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { AmbientCanvasField } from '@/components/layout/LoginAmbientBackground'
import { BookProgressVisual } from '@/features/app/BookProgressVisual'
import { ProgressLevelBar } from '@/features/app/ProgressLevelBar'
import { faixaDoNivel, tituloJornada } from '@/features/app/alunoProgress'
import { useBookProgressAnimation } from '@/features/app/useBookProgressAnimation'
import { useAlunoProgress } from '@/features/app/useAlunoProgress'
import { useHomeLevelUpNotice } from '@/features/app/useHomeLevelUpNotice'
import { cn } from '@/lib/utils'

interface HomeProgressCardProps {
  userId: string | undefined
}

export function HomeProgressCard({ userId }: HomeProgressCardProps) {
  const { data: progress, isLoading } = useAlunoProgress(userId)
  const { pageProgress, displayPct, justLeveledUp } = useBookProgressAnimation(progress)
  const levelUpBanner = useHomeLevelUpNotice(userId, progress?.nivel, progress?.nivelMaximo)
  const showLevelUp = justLeveledUp || levelUpBanner

  if (isLoading) {
    return (
      <div className="home-progress-wrap" aria-hidden>
        <p className="home-jornada-eyebrow">Sua jornada de leitura</p>
        <div className="jornada-card jornada-card--loading animate-pulse">
          <div className="jornada-card__head">
            <div className="jornada-card__avatar bg-primary-light/30" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-16 rounded-full bg-primary-light/40" />
              <div className="h-5 w-28 rounded-lg bg-primary-light/35" />
            </div>
          </div>
          <div className="mt-4 h-px bg-primary-light/25" />
          <div className="mt-4 h-6 w-20 rounded-lg bg-primary-light/40" />
          <div className="mt-3 h-2.5 w-full rounded-full bg-primary-light/30" />
          <div className="mt-5 h-10 w-full rounded-full bg-primary-light/35" />
        </div>
      </div>
    )
  }

  if (!progress) return null

  const faixa = faixaDoNivel(progress.nivel)
  const faixaRotulo = tituloJornada(progress.nivel)

  return (
    <div className="home-progress-wrap">
      <p className="home-jornada-eyebrow">Sua jornada de leitura</p>
      {showLevelUp && (
        <p className="home-level-up-banner" role="status">
          Você subiu de nível!
        </p>
      )}
      <Link
        to="/app/progresso"
        className={cn(
          'jornada-card jornada-card--interactive jornada-card--ambient group block no-underline',
          showLevelUp && 'jornada-card--celebrate',
        )}
        aria-label={`${faixaRotulo}. Nível ${progress.nivel}. ${progress.xp} XP. ${displayPct}% deste capítulo.`}
      >
        <AmbientCanvasField compact className="jornada-card__ambient ambient-canvas-field" />

        <div className="jornada-card__surface">
          <div className="jornada-card__head">
            <div className="jornada-card__avatar">
              <BookProgressVisual
                pageProgress={pageProgress}
                nivel={progress.nivel}
                marcadorCor="#003366"
                paleta={{
                  accent: faixa.cor,
                  marcador: '#003366',
                  pagina: 'rgb(0 51 102 / 0.15)',
                  paginaEscura: 'rgb(0 51 102 / 0.28)',
                  glow: faixa.cor,
                  barra: '#efb034',
                  barraTrack: '#e8eef0',
                  ambiente: '#ffffff',
                  faixaNome: faixa.nome,
                  texto: '#003366',
                  textoMuted: '#64748b',
                }}
                justLeveledUp={justLeveledUp}
                size="sm"
                cinematic
              />
            </div>
            <div className="jornada-card__head-text min-w-0">
              <span className="jornada-card__level-badge">Nível {progress.nivel}</span>
              <p className="jornada-card__title">{faixaRotulo}</p>
            </div>
          </div>

          <hr className="jornada-card__divider" />

          <div className="jornada-card__xp-row">
            <span className="jornada-card__xp-total">{progress.xp} XP</span>
            <span className="jornada-card__xp-range">
              {progress.xpNoNivel} / {progress.xpNecessarioNivel} XP
            </span>
          </div>

          <ProgressLevelBar
            className="jornada-card__bar"
            minimal
            pct={displayPct}
            nivel={progress.nivel}
            barra="#efb034"
            barraTrack="#e8eef0"
            xpTotal={progress.xp}
            xpParaProximo={progress.xpParaProximoNivel}
            nivelMaximo={progress.nivelMaximo}
          />

          {progress.nivelMaximo ? (
            <p className="jornada-card__hint">Nível máximo alcançado</p>
          ) : progress.xpParaProximoNivel > 0 ? (
            <p className="jornada-card__hint">
              Faltam {progress.xpParaProximoNivel} XP para o nível {progress.nivel + 1}
            </p>
          ) : null}

          <span className="jornada-card__cta">
            Ver minha jornada
            <ArrowRight className="jornada-card__cta-icon" strokeWidth={2} aria-hidden />
          </span>
        </div>
      </Link>
    </div>
  )
}
