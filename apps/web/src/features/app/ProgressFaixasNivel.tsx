import { FAIXAS_NIVEL, NIVEL_MAXIMO, faixaDoNivel } from '@/features/app/alunoProgress'
import { cn } from '@/lib/utils'

interface ProgressFaixasNivelProps {
  nivelAtual: number
}

export function ProgressFaixasNivel({ nivelAtual }: ProgressFaixasNivelProps) {
  const faixaAtual = faixaDoNivel(nivelAtual)

  return (
    <section className="space-y-4" aria-labelledby="faixas-nivel-title">
      <div>
        <h2 id="faixas-nivel-title" className="text-base font-semibold text-brand-navy">
          Os níveis da jornada
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          São {NIVEL_MAXIMO} níveis no total, divididos em {FAIXAS_NIVEL.length} faixas. Cada faixa
          muda a cor do seu card — você está em{' '}
          <strong className="font-medium text-text">{faixaAtual.nome}</strong> (nível {nivelAtual}).
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2" role="list">
        {FAIXAS_NIVEL.map((faixa) => {
          const ativa = faixa.id === faixaAtual.id
          return (
            <li
              key={faixa.id}
              className={cn(
                'overflow-hidden rounded-xl border transition-shadow',
                ativa ? 'ring-2 ring-offset-2' : 'border-border/80',
              )}
              style={
                ativa
                  ? ({
                      borderColor: faixa.cor,
                      ringColor: faixa.cor,
                      background: faixa.cor,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div
                className={cn(
                  'flex items-stretch gap-0',
                  !ativa && 'rounded-xl border border-border/60 bg-white',
                )}
              >
                <div
                  className="flex w-14 shrink-0 flex-col items-center justify-center px-1 py-3 text-center text-white"
                  style={{ background: faixa.cor }}
                  aria-hidden
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">
                    Nv
                  </span>
                  <span className="text-xs font-bold tabular-nums">
                    {faixa.nivelMin}–{faixa.nivelMax}
                  </span>
                </div>
                <div
                  className={cn(
                    'flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5',
                    ativa ? 'text-white' : 'text-text',
                  )}
                  style={ativa ? { background: faixa.cor } : undefined}
                >
                  <p className={cn('font-semibold', ativa ? 'text-white' : 'text-brand-navy')}>
                    {faixa.nome}
                    {ativa && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wide opacity-90">
                        · você
                      </span>
                    )}
                  </p>
                  <p
                    className={cn(
                      'text-xs leading-snug',
                      ativa ? 'text-white/85' : 'text-text-muted',
                    )}
                  >
                    {faixa.rotulo}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
