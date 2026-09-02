import { cn } from '@/lib/utils'

interface ProgressLevelBarProps {
  pct: number
  barra: string
  barraTrack: string
  xpTotal: number
  xpParaProximo?: number
  nivelMaximo?: boolean
  nivel?: number
  compact?: boolean
  className?: string
}

export function ProgressLevelBar({
  pct,
  barra,
  barraTrack,
  xpTotal,
  xpParaProximo = 0,
  nivelMaximo = false,
  nivel = 1,
  compact = false,
  className,
}: ProgressLevelBarProps) {
  const isCapituloNovo = pct === 0 && nivel > 1
  const fillWidth = pct === 0 ? (isCapituloNovo ? 4 : 0) : Math.max(pct, 2)

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium text-text-muted">
          {compact ? 'Neste capítulo' : `Capítulo ${nivel}`}
        </span>
        <span className="leitura-jornada__pct font-semibold tabular-nums">{pct}%</span>
      </div>

      <div
        className={cn(
          'leitura-jornada__folha-track mt-1.5',
          isCapituloNovo && 'leitura-jornada__folha-track--fresh',
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% deste capítulo · ${xpTotal} XP total`}
        style={{ background: barraTrack }}
      >
        {isCapituloNovo && <span className="leitura-jornada__folha-seed" style={{ background: barra }} />}
        <div
          className={cn(
            'leitura-jornada__folha-fill',
            isCapituloNovo && 'leitura-jornada__folha-fill--seed',
          )}
          style={{
            width: `${fillWidth}%`,
            background: barra,
          }}
        />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-text-muted">
        <span className="leitura-jornada__xp-label font-medium">{xpTotal} XP no total</span>
        {!nivelMaximo && xpParaProximo > 0 && (
          <>
            <span aria-hidden>·</span>
            <span>faltam {xpParaProximo} XP</span>
          </>
        )}
        {isCapituloNovo && (
          <>
            <span aria-hidden>·</span>
            <span className="text-text-muted/90">folha em branco</span>
          </>
        )}
      </div>
    </div>
  )
}
