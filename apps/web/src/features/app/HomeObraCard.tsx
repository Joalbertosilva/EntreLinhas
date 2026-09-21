import { Link } from '@tanstack/react-router'
import type { TipoProducao } from '@tcc-sistema/types'
import { BookMarked, Feather, FileText, PenLine, Quote, Sparkles } from 'lucide-react'
import type { MinhaObraResumo } from '@/features/app/useMinhaObra'
import { DEFAULT_OBRA_COVER } from '@/lib/obraCover'
import { cn } from '@/lib/utils'

const TIPO_META: Record<
  TipoProducao,
  { label: string; icon: typeof BookMarked }
> = {
  capitulo: { label: 'Capítulo', icon: BookMarked },
  cronica: { label: 'Crônica', icon: FileText },
  conto: { label: 'Conto', icon: Feather },
  poema: { label: 'Poema', icon: Quote },
  reflexao: { label: 'Reflexão', icon: PenLine },
  outro: { label: 'Obra', icon: Sparkles },
}

interface HomeObraCardProps {
  obra: MinhaObraResumo | null
  isLoading?: boolean
}

function ObraCoverImage({
  src,
  alt,
  badge,
  tipoLabel,
}: {
  src: string
  alt: string
  badge?: string
  tipoLabel?: string
}) {
  return (
    <div
      className={cn(
        'home-obra-cover relative aspect-[2/3] w-full max-w-[11.5rem] overflow-hidden rounded-xl',
        'border border-primary/12 shadow-[var(--shadow-card)]',
        'transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card),0_12px_28px_rgb(0_51_102_/_0.12)]',
      )}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/75 via-brand-navy/15 to-transparent"
        aria-hidden
      />
      {badge && (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary shadow-sm">
          {badge}
        </span>
      )}
      {tipoLabel && (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted shadow-sm">
          {tipoLabel}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-primary shadow-sm">
          <PenLine className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </div>
  )
}

export function HomeObraCard({ obra, isLoading }: HomeObraCardProps) {
  if (isLoading) {
    return (
      <div className="home-obra-card animate-pulse">
        <div className="aspect-[2/3] w-full max-w-[11.5rem] rounded-xl bg-primary-light/40" />
        <div className="mt-4 h-5 w-2/3 rounded-lg bg-primary-light/50" />
        <div className="mt-2 h-4 w-1/2 rounded-lg bg-primary-light/30" />
      </div>
    )
  }

  if (!obra) {
    return (
      <Link to="/app/minha-obra" className="home-obra-card group block max-w-[16rem] no-underline">
        <ObraCoverImage
          src={DEFAULT_OBRA_COVER}
          alt="Ilustração de mãos escrevendo em um caderno — capa padrão da sua obra"
          badge="Sua obra"
        />
        <div className="mt-4">
          <p className="text-base font-semibold text-text group-hover:text-primary">Comece sua obra</p>
          <p className="mt-1 text-base leading-relaxed text-text-muted">
            Livro, crônica ou poema — seu espaço de escrita.
          </p>
        </div>
      </Link>
    )
  }

  const tipo = obra.ultimaProducao?.tipo ?? 'outro'
  const meta = TIPO_META[tipo]
  const coverSrc = obra.capa_url ?? DEFAULT_OBRA_COVER
  const coverAlt = obra.capa_url
    ? `Capa de ${obra.titulo}`
    : `Capa padrão de ${obra.titulo}`

  return (
    <Link to="/app/minha-obra" className="home-obra-card group block max-w-[16rem] no-underline">
      <ObraCoverImage
        src={coverSrc}
        alt={coverAlt}
        badge={!obra.capa_url ? 'Capa padrão' : undefined}
        tipoLabel={meta.label}
      />
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
