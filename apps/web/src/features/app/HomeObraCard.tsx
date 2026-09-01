import { Link } from '@tanstack/react-router'
import type { TipoProducao } from '@tcc-sistema/types'
import { BookMarked, Feather, FileText, PenLine, Quote, Sparkles } from 'lucide-react'
import type { MinhaObraResumo } from '@/features/app/useMinhaObra'
import { cn } from '@/lib/utils'

const TIPO_META: Record<
  TipoProducao,
  { label: string; icon: typeof BookMarked; tint: string }
> = {
  capitulo: { label: 'Capítulo', icon: BookMarked, tint: 'from-primary-light/90 to-white' },
  cronica: { label: 'Crônica', icon: FileText, tint: 'from-accent-light/80 to-white' },
  conto: { label: 'Conto', icon: Feather, tint: 'from-primary-light/75 to-accent-light/35' },
  poema: { label: 'Poema', icon: Quote, tint: 'from-violet-100/80 to-white' },
  reflexao: { label: 'Reflexão', icon: PenLine, tint: 'from-teal-50/90 to-white' },
  outro: { label: 'Obra', icon: Sparkles, tint: 'from-surface to-white' },
}

interface HomeObraCardProps {
  obra: MinhaObraResumo | null
  isLoading?: boolean
}

export function HomeObraCard({ obra, isLoading }: HomeObraCardProps) {
  if (isLoading) {
    return (
      <div className="home-obra-card home-obra-card-skeleton animate-pulse">
        <div className="aspect-[4/3] rounded-2xl bg-primary-light/40 sm:aspect-[16/10]" />
        <div className="mt-4 h-5 w-2/3 rounded-lg bg-primary-light/50" />
        <div className="mt-2 h-4 w-1/2 rounded-lg bg-primary-light/30" />
      </div>
    )
  }

  if (!obra) {
    return (
      <Link to="/app/minha-obra" className="home-obra-card group block no-underline">
        <div
          className={cn(
            'home-obra-cover relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl sm:aspect-[16/10]',
            'border border-dashed border-primary/25 bg-gradient-to-br from-primary-light/70 to-accent-light/40',
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated/90 text-primary shadow-[var(--shadow-soft)]">
            <PenLine className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-text group-hover:text-primary">Comece sua obra</p>
          <p className="mt-1 text-sm text-text-muted">Livro, crônica, poema — o formato é seu.</p>
        </div>
      </Link>
    )
  }

  const tipo = obra.ultimaProducao?.tipo ?? 'outro'
  const meta = TIPO_META[tipo]
  const Icon = meta.icon

  return (
    <Link to="/app/minha-obra" className="home-obra-card group block no-underline">
      <div
        className={cn(
          'home-obra-cover relative aspect-[4/3] overflow-hidden rounded-2xl border border-primary/10 sm:aspect-[16/10]',
          'bg-gradient-to-br shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:-translate-y-0.5',
          !obra.capa_url && meta.tint,
        )}
      >
        {obra.capa_url ? (
          <img src={obra.capa_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgb(255_255_255/0.55),transparent_55%)]" />
            <div className="absolute left-4 top-4 rounded-full bg-elevated/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted shadow-sm">
              {meta.label}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-elevated/90 text-primary shadow-sm">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-text group-hover:text-primary">
          {obra.titulo}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
          {obra.descricao ??
            (obra.ultimaProducao
              ? `Última produção: ${obra.ultimaProducao.titulo}`
              : 'Toque para continuar escrevendo')}
        </p>
      </div>
    </Link>
  )
}
