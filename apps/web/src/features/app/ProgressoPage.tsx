import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import {
  XP_CONCLUIDO,
  XP_EM_ANDAMENTO,
  XP_NIVEL_THRESHOLDS,
  xpIncrementoProximoNivel,
  tituloJornada,
  rotuloFaixaNivel,
} from '@/features/app/alunoProgress'
import { BookProgressVisual } from '@/features/app/BookProgressVisual'
import { ProgressFaixasNivel } from '@/features/app/ProgressFaixasNivel'
import { ProgressLevelBar } from '@/features/app/ProgressLevelBar'
import {
  mensagemAcolhedora,
  paletaLivroCinematico,
  resumoLeituras,
} from '@/features/app/progressCopy'
import { ScrollReveal } from '@/features/app'
import { useBookProgressAnimation } from '@/features/app/useBookProgressAnimation'
import { useAlunoProgress } from '@/features/app/useAlunoProgress'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export function ProgressoPage() {
  const { profile } = useAuth()
  const { data: progress, isLoading } = useAlunoProgress(profile?.id)
  const { pageProgress, displayPct, justLeveledUp } = useBookProgressAnimation(progress)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!progress) return null

  const paleta = paletaLivroCinematico(progress.nivel, progress.progressoNivelPct)
  const heroStyle = {
    '--jornada-ambient': paleta.ambiente,
    '--jornada-glow': paleta.glow,
    '--jornada-accent': paleta.accent,
    '--jornada-progress': paleta.barra,
  } as CSSProperties

  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-6">
      <ScrollReveal>
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-sm text-text-muted">Sua leitura, no seu tempo</p>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-navy sm:text-[1.75rem]">
            O caminho que você já leu
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-text-muted">
            Cada obra soma experiência. O livrinho vai ganhando cor conforme você avança — e a
            barrinha mostra o quanto falta para virar o próximo capítulo.
          </p>
        </header>
      </ScrollReveal>

      <ScrollReveal delayMs={40}>
        <div
          className={cn(
            'leitura-jornada-hero leitura-jornada-hero--interactive leitura-jornada-hero--solid',
            justLeveledUp && 'leitura-jornada--celebrate',
          )}
          style={heroStyle}
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="leitura-jornada__book-col leitura-jornada__book-col--solid">
              <BookProgressVisual
              pageProgress={pageProgress}
              nivel={progress.nivel}
              marcadorCor={paleta.marcador}
              paleta={paleta}
              justLeveledUp={justLeveledUp}
              size="lg"
              cinematic
            />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 sm:justify-start">
                <p className="text-lg font-medium text-white">{tituloJornada(progress.nivel)}</p>
                <span className="leitura-jornada__faixa-chip text-xs font-semibold uppercase tracking-wide">
                  {rotuloFaixaNivel(progress.nivel)}
                </span>
                <span className="text-sm font-semibold tabular-nums text-white">{progress.xp} XP</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/82">{mensagemAcolhedora(progress)}</p>
              <p className="mt-2 text-sm text-white/90">{resumoLeituras(progress)}</p>
            </div>
          </div>

          <ProgressLevelBar
            className="mt-6"
            pct={displayPct}
            barra={paleta.barra}
            barraTrack={paleta.barraTrack}
            xpTotal={progress.xp}
            nivel={progress.nivel}
            xpParaProximo={progress.xpParaProximoNivel}
            nivelMaximo={progress.nivelMaximo}
            onSolidBg
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={60}>
        <ProgressFaixasNivel nivelAtual={progress.nivel} />
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
        <section className="space-y-4 rounded-2xl border border-brand-navy/8 bg-white/80 p-6">
          <h2 className="text-base font-medium text-brand-navy">Como funciona</h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-muted">
            <p>
              <strong className="font-medium text-text">Terminar uma obra</strong> vale +{XP_CONCLUIDO} XP
              — é como virar uma página inteira de uma vez.
            </p>
            <p>
              <strong className="font-medium text-text">Começar a ler</strong> vale +{XP_EM_ANDAMENTO} XP
              — um primeiro passo, mais leve, mas real.
            </p>
            <p className="rounded-xl bg-brand-light/45 px-4 py-3 text-[13px]">
              O capítulo 2 chega com a primeira obra terminada. Depois, cada capítulo pede um pouco mais —
              no seu ritmo, sem pressa.
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delayMs={120}>
        <details className="rounded-2xl border border-brand-navy/8 bg-white/70">
          <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-brand-navy marker:content-none list-none [&::-webkit-details-marker]:hidden">
            Capítulos seguintes
          </summary>
          <ul className="space-y-2 border-t border-border/60 px-5 py-4">
            {Array.from({ length: Math.min(6, NIVEL_MAXIMO - progress.nivel) }, (_, i) => {
              const cap = progress.nivel + i + 1
              const degrau = xpIncrementoProximoNivel(cap - 1)
              return (
                <li key={cap} className="flex justify-between gap-3 text-sm">
                  <span className="text-text">Capítulo {cap}</span>
                  <span className="text-xs text-text-muted">
                    {cap === 2 ? '1 obra terminada' : `+${degrau} XP neste degrau`}
                  </span>
                </li>
              )
            })}
          </ul>
        </details>
      </ScrollReveal>

      <ScrollReveal delayMs={160}>
        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
          <Link to="/app/minhas-leituras">
            <Button variant="brand">Ir para minhas leituras</Button>
          </Link>
          <Link to="/app">
            <Button variant="ghost" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Voltar
            </Button>
          </Link>
        </div>
      </ScrollReveal>
    </div>
  )
}

const NIVEL_MAXIMO = XP_NIVEL_THRESHOLDS.length
