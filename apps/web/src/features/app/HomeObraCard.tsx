import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { TipoProducao } from '@tcc-sistema/types'
import { BookMarked, Feather, FileText, PenLine, Quote, Sparkles } from 'lucide-react'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { Speakable } from '@/features/accessibility/Speakable'
import { SpeakButton } from '@/features/accessibility/SpeakButton'
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
  /** Capa + áudio abaixo + texto ao lado (painel da home). */
  variant?: 'default' | 'row' | 'hero-row'
  speakLabel?: string
}

function ObraCoverImage({
  src,
  alt,
  badge,
  tipoLabel,
  compact,
}: {
  src: string
  alt: string
  badge?: string
  tipoLabel?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'home-obra-cover relative aspect-[2/3] w-full overflow-hidden rounded-xl',
        'border border-primary/12 bg-primary-light/35 shadow-[var(--shadow-card)]',
        'transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card),0_12px_28px_rgb(0_51_102_/_0.12)]',
        compact ? 'max-w-[7.25rem]' : 'max-w-[11.5rem]',
      )}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain object-center"
        loading="lazy"
      />
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

interface HeroRowLayoutProps {
  to: string
  label: string
  cover: ReactNode
  body: ReactNode
}

function HeroRowLayout({ to, label, cover, body }: HeroRowLayoutProps) {
  const { audioEnabled } = useAccessibility()

  return (
    <article className="home-obra-card home-obra-card--hero-row group">
      <Link to={to} className="home-obra-card__cover-link block no-underline">
        {cover}
      </Link>
      {audioEnabled === true && (
        <div className="home-obra-card__speak-aside">
          <SpeakButton label={label} />
        </div>
      )}
      <Speakable hideButton label={label} className="home-obra-card__text-col min-w-0">
        <Link to={to} className="home-obra-card__body block no-underline">
          {body}
        </Link>
      </Speakable>
    </article>
  )
}

export function HomeObraCard({
  obra,
  isLoading,
  variant = 'default',
  speakLabel,
}: HomeObraCardProps) {
  const isHeroRow = variant === 'hero-row'
  const isRow = variant === 'row'
  const cardWidth = isRow || isHeroRow ? undefined : 'w-[8.75rem] sm:w-[9.5rem]'

  if (isLoading) {
    return (
      <div
        className={cn(
          'home-obra-card animate-pulse',
          isHeroRow && 'home-obra-card--hero-row',
          isRow && 'home-obra-card--row',
          !isRow && !isHeroRow && cn('flex flex-col', cardWidth),
        )}
      >
        <div
          className={cn(
            'aspect-[2/3] rounded-xl bg-primary-light/40',
            isHeroRow ? 'w-full' : 'w-full max-w-[7.25rem]',
          )}
        />
        <div
          className={cn(
            'home-obra-card__body h-5 w-2/3 rounded-lg bg-primary-light/50',
            isHeroRow ? 'home-obra-card__text-col mt-0' : 'mt-4',
          )}
        />
      </div>
    )
  }

  if (!obra) {
    const emptyLabel =
      speakLabel ?? 'Comece sua obra. Livro, crônica ou poema — seu espaço de escrita.'

    if (isHeroRow) {
      return (
        <HeroRowLayout
          to="/app/minha-obra"
          label={emptyLabel}
          cover={
            <ObraCoverImage
              src={DEFAULT_OBRA_COVER}
              alt="Ilustração de mãos escrevendo em um caderno — capa padrão da sua obra"
              badge="Sua obra"
            />
          }
          body={
            <>
              <p className="text-base font-semibold text-text group-hover:text-primary">Comece sua obra</p>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">
                Livro, crônica ou poema — seu espaço de escrita.
              </p>
            </>
          }
        />
      )
    }

    if (isRow) {
      return (
        <Link to="/app/minha-obra" className="home-obra-card home-obra-card--row group block no-underline">
          <ObraCoverImage
            src={DEFAULT_OBRA_COVER}
            alt="Ilustração de mãos escrevendo em um caderno — capa padrão da sua obra"
            badge="Sua obra"
          />
          <div className="home-obra-card__body mt-4">
            <p className="text-base font-semibold text-text group-hover:text-primary">Comece sua obra</p>
            <p className="mt-1 text-base leading-relaxed text-text-muted">
              Livro, crônica ou poema — seu espaço de escrita.
            </p>
          </div>
        </Link>
      )
    }

    return (
      <article className={cn('home-obra-card group flex flex-col', cardWidth)}>
        <Link to="/app/minha-obra" className="block no-underline">
          <ObraCoverImage
            src={DEFAULT_OBRA_COVER}
            alt="Ilustração de mãos escrevendo em um caderno — capa padrão da sua obra"
            badge="Sua obra"
            compact
          />
        </Link>
        <Speakable label={emptyLabel} className="content-card__speakable mt-2.5 px-0.5">
          <Link to="/app/minha-obra" className="home-obra-card__body block no-underline">
            <p className="text-sm font-semibold text-text group-hover:text-primary">Comece sua obra</p>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              Livro, crônica ou poema — seu espaço de escrita.
            </p>
          </Link>
        </Speakable>
      </article>
    )
  }

  const tipo = obra.ultimaProducao?.tipo ?? 'outro'
  const meta = TIPO_META[tipo]
  const coverSrc = obra.capa_url ?? DEFAULT_OBRA_COVER
  const coverAlt = obra.capa_url ? `Capa de ${obra.titulo}` : `Capa padrão de ${obra.titulo}`
  const label =
    speakLabel ??
    [obra.titulo, obra.descricao ?? obra.ultimaProducao?.titulo].filter(Boolean).join('. ')

  const bodyContent = (
    <>
      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-text group-hover:text-primary">
        {obra.titulo}
      </h3>
      <p className="mt-1 line-clamp-3 text-sm text-text-muted">
        {obra.descricao ??
          (obra.ultimaProducao
            ? `Última produção: ${obra.ultimaProducao.titulo}`
            : 'Toque para continuar escrevendo')}
      </p>
    </>
  )

  if (isHeroRow) {
    return (
      <HeroRowLayout
        to="/app/minha-obra"
        label={label}
        cover={
          <ObraCoverImage
            src={coverSrc}
            alt={coverAlt}
            badge={!obra.capa_url ? 'Capa padrão' : undefined}
            tipoLabel={meta.label}
          />
        }
        body={bodyContent}
      />
    )
  }

  if (isRow) {
    return (
      <Link to="/app/minha-obra" className="home-obra-card home-obra-card--row group block no-underline">
        <ObraCoverImage
          src={coverSrc}
          alt={coverAlt}
          badge={!obra.capa_url ? 'Capa padrão' : undefined}
          tipoLabel={meta.label}
        />
        <div className="home-obra-card__body mt-4">{bodyContent}</div>
      </Link>
    )
  }

  return (
    <article className={cn('home-obra-card group flex flex-col', cardWidth)}>
      <Link to="/app/minha-obra" className="block no-underline">
        <ObraCoverImage
          src={coverSrc}
          alt={coverAlt}
          badge={!obra.capa_url ? 'Capa padrão' : undefined}
          tipoLabel={meta.label}
          compact
        />
      </Link>
      <Speakable label={label} className="content-card__speakable mt-2.5 px-0.5">
        <Link to="/app/minha-obra" className="home-obra-card__body block no-underline">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text group-hover:text-primary">
            {obra.titulo}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-text-muted">
            {obra.descricao ??
              (obra.ultimaProducao
                ? `Última produção: ${obra.ultimaProducao.titulo}`
                : 'Toque para continuar escrevendo')}
          </p>
        </Link>
      </Speakable>
    </article>
  )
}
