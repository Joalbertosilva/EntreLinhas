import { cn } from '@/lib/utils'

interface JornadaXpBarProps {
  barPct: number
  xpNoNivel: number
  xpNecessarioNivel: number
  xpParaProximoNivel: number
  nivel: number
  nivelMaximo?: boolean
  className?: string
  /** Fundo escuro do hero em /app/progresso */
  onHero?: boolean
}

export function JornadaXpBar({
  barPct,
  xpNoNivel,
  xpNecessarioNivel,
  xpParaProximoNivel,
  nivel,
  nivelMaximo = false,
  className,
  onHero = false,
}: JornadaXpBarProps) {
  const pct = nivelMaximo ? 100 : Math.max(0, Math.min(100, barPct))

  return (
    <div className={cn(onHero && 'jornada-xp-bar--on-hero', className)}>
      <div className="jornada-card__xp-bar-row">
        <div
          className="jornada-card__xp-track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso do nível ${nivel}`}
        >
          <div className="jornada-card__xp-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="jornada-card__xp-inline">
          {xpNoNivel} / {xpNecessarioNivel} xp
        </span>
      </div>

      {nivelMaximo ? (
        <p className="jornada-card__hint">Nível máximo alcançado</p>
      ) : xpParaProximoNivel > 0 ? (
        <p className="jornada-card__hint">
          Faltam {xpParaProximoNivel} XP para o nível {nivel + 1}
        </p>
      ) : null}
    </div>
  )
}