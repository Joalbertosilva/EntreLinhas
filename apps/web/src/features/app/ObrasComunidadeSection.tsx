import { Link } from '@tanstack/react-router'
import { BookOpen, Loader2, Users } from 'lucide-react'
import { useObrasPublicas } from '@/features/app/useMinhaObra'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { CATEGORIA_OBRA_LABEL } from '@/lib/obraCategoriaLabels'
import { cn } from '@/lib/utils'

interface ObrasComunidadeSectionProps {
  limit?: number
  className?: string
  /** Na home some se vazio; na página de livros mostra estado vazio */
  hideWhenEmpty?: boolean
  /** Ao lado do card de nível na home */
  variant?: 'default' | 'inline'
}

export function ObrasComunidadeSection({
  limit = 12,
  className,
  hideWhenEmpty = false,
  variant = 'default',
}: ObrasComunidadeSectionProps) {
  const inline = variant === 'inline'
  const { data: obras = [], isLoading } = useObrasPublicas(limit)

  if (isLoading) {
    return (
      <section
        className={cn('home-obras-publicas', inline && 'home-obras-publicas--inline', className)}
        aria-busy="true"
      >
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Carregando obras da comunidade…
        </p>
      </section>
    )
  }

  if (obras.length === 0) {
    if (hideWhenEmpty) return null
    return (
      <section className={cn('home-obras-publicas', className)} aria-labelledby="obras-comunidade-title">
        <SectionHeader />
        <p className="rounded-2xl border border-dashed border-primary/12 bg-white/75 px-5 py-4 text-sm text-text-muted">
          Nenhuma obra publicada ainda. Quando os alunos publicarem textos em{' '}
          <strong className="font-medium text-text">Minha obra</strong>, elas aparecerão aqui.
        </p>
      </section>
    )
  }

  return (
    <section
      className={cn('home-obras-publicas', inline && 'home-obras-publicas--inline', className)}
      aria-labelledby="obras-comunidade-title"
    >
      <SectionHeader count={obras.length} inline={inline} />
      <ul
        className={cn(
          'flex gap-4 overflow-x-auto pb-2 scrollbar-thin',
          inline && 'home-obras-publicas__list--inline',
        )}
        role="list"
      >
        {obras.map((obra) => (
          <li key={obra.id} className="shrink-0">
            <Link
              to="/app/obras/$obraId"
              params={{ obraId: obra.id }}
              className="home-obra-publica-card group block w-[140px] no-underline sm:w-[160px]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-primary/10 bg-primary-light/30 shadow-[var(--shadow-soft)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-card)]">
                {obra.capa_url ? (
                  <img
                    src={obra.capa_url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary/45">
                    <BookOpen className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                  </div>
                )}
                <span className="absolute bottom-2 left-2 rounded-full bg-elevated/92 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-text-muted backdrop-blur-sm">
                  {TIPO_OBRA_LABEL[obra.tipo]}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold text-text group-hover:text-primary">
                {obra.titulo}
              </p>
              {obra.autor && (
                <p className="line-clamp-1 text-xs text-text-muted">{obra.autor.nome}</p>
              )}
              {'categoria' in obra && obra.categoria !== 'outro' && (
                <p className="mt-0.5 line-clamp-1 text-[10px] font-medium uppercase tracking-wide text-primary/70">
                  {CATEGORIA_OBRA_LABEL[obra.categoria]}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SectionHeader({ count, inline = false }: { count?: number; inline?: boolean }) {
  if (inline) {
    return (
      <div className="home-obras-publicas__inline-head mb-3">
        <h2 id="obras-comunidade-title" className="home-hero-section-label mb-0">
          Livros da comunidade
        </h2>
        {count != null && count > 0 && (
          <p className="mt-1 text-xs text-text-muted">
            {count} {count === 1 ? 'obra publicada' : 'obras publicadas'}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h2 id="obras-comunidade-title" className="text-base font-semibold text-brand-navy sm:text-lg">
            Livros da comunidade
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            {count != null && count > 0
              ? `${count} ${count === 1 ? 'obra publicada' : 'obras publicadas'} por alunos`
              : 'Textos publicados por outros alunos'}
          </p>
        </div>
      </div>
    </div>
  )
}
