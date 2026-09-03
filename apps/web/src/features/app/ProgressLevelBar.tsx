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
  /** Só a barra, sem rótulos — uso na home */
  minimal?: boolean
  className?: string
  /** Texto claro sobre fundo colorido sólido */
  onSolidBg?: boolean
  /** Oculta "folha em branco" — uso na home */
  hideFreshHint?: boolean
  /** Oculta "X XP no total" — quando o total já aparece em destaque acima */
  hideXpTotal?: boolean
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
  minimal = false,
  className,
  onSolidBg = false,
  hideFreshHint = false,
  hideXpTotal = false,
}: ProgressLevelBarProps) {
  const isCapituloNovo = pct === 0 && nivel > 1
  const fillWidth = pct === 0 ? (isCapituloNovo ? 4 : 0) : Math.max(pct, 2)

  if (minimal) {
    return (
      <div className={cn(onSolidBg && 'leitura-jornada__bar--solid', className)}>
        <div
          className={cn(
            'leitura-jornada__folha-track',
            isCapituloNovo && 'leitura-jornada__folha-track--fresh',
          )}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% deste capítulo`}
          style={{ background: barraTrack }}
        >
          {isCapituloNovo && (
            <span className="leitura-jornada__folha-seed" style={{ background: barra }} />
          )}
          <div
            className={cn(
              'leitura-jornada__folha-fill',
              isCapituloNovo && 'leitura-jornada__folha-fill--seed',
            )}
            style={{ width: `${fillWidth}%`, background: barra }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(onSolidBg && 'leitura-jornada__bar--solid', className)}>
      <div className="leitura-jornada__bar-head flex items-center justify-between gap-2 text-[11px]">
        <span className={cn('font-medium', onSolidBg ? 'text-white/72' : 'text-text-muted')}>
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

      <div
        className={cn(
          'leitura-jornada__bar-meta mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]',
          onSolidBg ? 'text-white/58' : 'text-text-muted',
        )}
      >
        {!hideXpTotal && (
          <span className="leitura-jornada__xp-label font-medium">{xpTotal} XP no total</span>
        )}
        {!hideXpTotal && !nivelMaximo && xpParaProximo > 0 && (
          <>
            <span aria-hidden>·</span>
            <span>faltam {xpParaProximo} XP</span>
          </>
        )}
        {hideXpTotal && !nivelMaximo && xpParaProximo > 0 && (
          <span>faltam {xpParaProximo} XP</span>
        )}
        {hideXpTotal && nivelMaximo && <span>Nível máximo</span>}
        {isCapituloNovo && !hideFreshHint && (
          <>
            <span aria-hidden>·</span>
            <span className={onSolidBg ? 'text-white/70' : 'text-text-muted/90'}>folha em branco</span>
          </>
        )}
      </div>
    </div>
  )
}
