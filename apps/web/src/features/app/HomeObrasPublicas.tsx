import { Link } from '@tanstack/react-router'
import { BookOpen, Loader2 } from 'lucide-react'
import { useObrasPublicas } from '@/features/app/useMinhaObra'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { ScrollReveal } from '@/features/app/ScrollReveal'

export function HomeObrasPublicas() {
  const { data: obras = [], isLoading } = useObrasPublicas(8)

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Carregando obras da comunidade…
      </p>
    )
  }

  if (obras.length === 0) return null

  return (
    <ScrollReveal delayMs={80}>
      <section className="home-obras-publicas" aria-labelledby="home-obras-publicas-title">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="home-obras-publicas-title" className="home-hero-section-label">
              Obras da comunidade
            </h2>
            <p className="mt-1 text-sm text-text-muted">Textos publicados por outros alunos</p>
          </div>
        </div>
        <ul className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin" role="list">
          {obras.map((obra) => (
            <li key={obra.id} className="shrink-0">
              <Link
                to="/app/obras/$obraId"
                params={{ obraId: obra.id }}
                className="home-obra-publica-card group block w-[140px] no-underline sm:w-[152px]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-primary/10 bg-primary-light/40 shadow-[var(--shadow-soft)]">
                  {obra.capa_url ? (
                    <img src={obra.capa_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary/45">
                      <BookOpen className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 rounded-full bg-elevated/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-text-muted">
                    {TIPO_OBRA_LABEL[obra.tipo]}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-text group-hover:text-primary">
                  {obra.titulo}
                </p>
                {obra.autor && (
                  <p className="line-clamp-1 text-xs text-text-muted">{obra.autor.nome}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ScrollReveal>
  )
}
