import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { AppSectionId } from '@/features/app/appNavigation'
import type { HomeSectionConfig } from '@/features/app/homeSections'
import { ContentCard } from '@/features/app/ContentCard'
import { ContentCardPlaceholder } from '@/features/app/ContentCardPlaceholder'
import { SectionIcon } from '@/features/app/SectionIcon'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import {
  countPlaceholders,
  useSectionConteudos,
} from '@/features/app/useConteudos'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ContentCarouselProps {
  section: HomeSectionConfig
  showViewAll?: boolean
  variant?: 'default' | 'hero'
  /** Grid 4 colunas (como destaques); home usa limite, páginas de seção ilimitado */
  layout?: 'carousel' | 'grid'
  /** Máximo de itens no grid; omitir = mostrar tudo o que foi carregado */
  gridLimit?: number
  overrideConteudos?: ConteudoCardData[]
  externalLoading?: boolean
  /** Cabeçalho com título da seção (desligar em páginas dedicadas que já têm h1) */
  showSectionHeader?: boolean
  fadeTone?: 'default' | 'hero' | 'catalog'
}

const SECTION_ICON: Partial<Record<string, AppSectionId>> = {
  destaques: 'home',
  livros: 'livros',
  cronicas: 'cronicas',
  musicas: 'musicas',
  poemas: 'poemas',
  videos: 'videos',
}

export function ContentCarousel({
  section,
  showViewAll = true,
  variant = 'default',
  layout = 'carousel',
  gridLimit,
  overrideConteudos,
  externalLoading = false,
  showSectionHeader = true,
  fadeTone = 'default',
}: ContentCarouselProps) {
  const isHero = variant === 'hero'
  const isDestaques = section.id === 'destaques'
  const usesExternalData = overrideConteudos !== undefined
  const { data: fetchedConteudos = [], isLoading: fetchLoading, isError } = useSectionConteudos(
    section,
    { enabled: !usesExternalData },
  )
  const isLoading = usesExternalData ? externalLoading : fetchLoading
  const isDestaquesHeroGrid = isHero && isDestaques
  const isGridLayout = isDestaquesHeroGrid || layout === 'grid'
  const effectiveGridLimit = gridLimit ?? (isDestaques ? section.placeholderCount : undefined)

  const sourceConteudos = overrideConteudos ?? fetchedConteudos
  const conteudos = sourceConteudos
    .filter((item) => !isDestaques || item.tipo !== 'video')
    .slice(0, isGridLayout && effectiveGridLimit != null ? effectiveGridLimit : undefined)
  const hasRealContent = conteudos.length > 0

  const isHomePreviewGrid = isGridLayout && gridLimit != null && !isDestaquesHeroGrid

  const placeholderCount = useMemo(() => {
    if (usesExternalData && !externalLoading && hasRealContent) return 0
    if (isGridLayout) {
      const gridTarget = effectiveGridLimit ?? 8
      if (isLoading) return gridTarget
      if (isHomePreviewGrid) {
        return Math.max(0, gridTarget - conteudos.length)
      }
      if (conteudos.length > 0) return 0
      return Math.min(4, gridTarget)
    }
    if (isLoading) return section.placeholderCount
    return countPlaceholders(conteudos.length, section.placeholderCount)
  }, [
    conteudos.length,
    effectiveGridLimit,
    externalLoading,
    hasRealContent,
    isGridLayout,
    isHomePreviewGrid,
    isLoading,
    section.placeholderCount,
    usesExternalData,
  ])

  const iconSection = SECTION_ICON[section.id] ?? 'livros'
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < maxScroll - 8)
  }, [])

  const contentKey = useMemo(
    () => `${section.id}:${conteudos.map((c) => c.id).join(',')}:${placeholderCount}:${isLoading}`,
    [conteudos, placeholderCount, isLoading, section.id],
  )

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.scrollLeft = 0
    updateScrollState()
  }, [contentKey, updateScrollState])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })

    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [contentKey, updateScrollState])

  const scrollByStep = (direction: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const step = Math.max(el.clientWidth * 0.72, 240)
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  const carouselDensityClass = isHero || isDestaques
    ? 'content-carousel--destaques'
    : 'content-carousel--section'

  if (isGridLayout) {
    const gridLabel = isDestaques
      ? 'Destaques do EntreLinhas'
      : `Pré-visualização de ${section.title}`

    return (
      <section
        id={isHero ? undefined : `section-${section.id}`}
        className={cn(isHero ? 'space-y-0' : 'space-y-3 scroll-mt-28')}
        aria-labelledby={isHero ? undefined : `section-${section.id}-title`}
        aria-label={isHero ? 'Conteúdos em destaque' : undefined}
      >
        {!isHero && showSectionHeader && (
          <div className="flex min-w-0 items-start gap-3">
            <SectionIcon section={iconSection} size="sm" className="mt-0.5 shadow-none" />
            <div className="min-w-0">
              <div className="section-head-inline">
                <h2
                  id={`section-${section.id}-title`}
                  className="text-lg font-semibold tracking-tight text-brand-navy sm:text-xl"
                >
                  {section.title}
                </h2>
                {showViewAll && section.route && (
                  <Link to={section.route} className="hidden sm:inline-flex">
                    <Button variant="ghost" size="sm" className="h-auto px-0 py-0 text-text-muted hover:text-primary">
                      Ver tudo
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </Link>
                )}
              </div>
              {section.subtitle && (
                <p className="mt-0.5 text-sm text-text-muted">{section.subtitle}</p>
              )}
            </div>
          </div>
        )}

        {isError && !usesExternalData && (
          <p className="text-sm text-error">
            {isDestaques
              ? 'Não foi possível carregar os destaques. Tente recarregar a página.'
              : 'Não foi possível carregar os conteúdos desta seção. Tente recarregar a página.'}
          </p>
        )}

        {!isHero && !isLoading && !isError && !hasRealContent && section.id === 'destaques' && (
          <p className="text-sm text-text-muted">
            Os destaques mostram livros, crônicas, poemas e músicas mais curtidos. Vídeos ficam no
            carrossel principal e nas faixas abaixo de cada seção, conforme o admin definir.
          </p>
        )}

        {!isHero && !isLoading && !isError && !hasRealContent && section.id !== 'destaques' && (
          <p className="text-sm text-text-muted">
            Nenhum conteúdo ativo aqui ainda. Os cards tracejados abaixo são apenas decorativos.
          </p>
        )}

        <div
          className={cn(
            'catalog-preview-grid',
            isHomePreviewGrid && 'catalog-preview-grid--home-slot',
          )}
          role="list"
          aria-label={gridLabel}
        >
          {conteudos.map((conteudo) => (
            <ContentCard
              key={conteudo.id}
              conteudo={conteudo}
              showTipo={isDestaques}
              fluid
            />
          ))}
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <ContentCardPlaceholder key={`ph-${i}`} tipo={section.tipo} index={i} fluid />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      id={isHero ? undefined : `section-${section.id}`}
      className={cn(isHero ? 'space-y-0' : 'space-y-3 scroll-mt-28')}
      aria-labelledby={isHero ? undefined : `section-${section.id}-title`}
      aria-label={isHero ? 'Conteúdos em destaque' : undefined}
    >
      {!isHero && (
        <div className="flex min-w-0 items-start gap-3">
          <SectionIcon section={iconSection} size="sm" className="mt-0.5 shadow-none" />
          <div className="min-w-0">
            <div className="section-head-inline">
              <h2
                id={`section-${section.id}-title`}
                className="text-lg font-semibold tracking-tight text-brand-navy sm:text-xl"
              >
                {section.title}
              </h2>
              {showViewAll && section.route && (
                <Link to={section.route} className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm" className="h-auto px-0 py-0 text-text-muted hover:text-primary">
                    Ver tudo
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
              )}
            </div>
            {section.subtitle && (
              <p className="mt-0.5 text-sm text-text-muted">{section.subtitle}</p>
            )}
          </div>
        </div>
      )}

      {isError && !overrideConteudos && (
        <p className="text-sm text-error">
          Não foi possível carregar os conteúdos desta seção. Tente recarregar a página.
        </p>
      )}

      {!isHero && !isLoading && !isError && !hasRealContent && section.id === 'destaques' && (
        <p className="text-sm text-text-muted">
          Os destaques mostram livros, crônicas, poemas e músicas mais curtidos. Vídeos ficam no
          carrossel principal e nas faixas abaixo de cada seção, conforme o admin definir.
        </p>
      )}

      {!isHero && !isLoading && !isError && !hasRealContent && section.id !== 'destaques' && (
        <p className="text-sm text-text-muted">
          Nenhum conteúdo ativo aqui ainda. Os cards tracejados abaixo são apenas decorativos.
        </p>
      )}

      <div
        className={cn(
          'content-carousel relative',
          carouselDensityClass,
          fadeTone === 'hero' && 'content-carousel-fade-hero',
          fadeTone === 'catalog' && 'content-carousel-fade-catalog',
          canScrollRight && fadeTone === 'default' && 'content-carousel-fade-right',
          canScrollLeft && fadeTone === 'default' && 'content-carousel-fade-left',
          canScrollRight && fadeTone !== 'default' && 'content-carousel-fade-right',
          canScrollLeft && fadeTone !== 'default' && 'content-carousel-fade-left',
        )}
      >
        {canScrollLeft && (
          <CarouselArrow direction="left" onClick={() => scrollByStep('left')} />
        )}
        {canScrollRight && (
          <CarouselArrow direction="right" onClick={() => scrollByStep('right')} />
        )}

        <div
          ref={trackRef}
          className="carousel-track flex gap-3 overflow-x-auto pb-1 pt-0.5 snap-x snap-mandatory sm:gap-4"
          role="list"
          aria-label={`Pré-visualização de ${section.title}`}
        >
          {conteudos.map((conteudo) => (
            <ContentCard
              key={conteudo.id}
              conteudo={conteudo}
              showTipo={isDestaques}
            />
          ))}
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <ContentCardPlaceholder key={`ph-${i}`} tipo={section.tipo} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: 'left' | 'right'
  onClick: () => void
}) {
  const isRight = direction === 'right'
  const Icon = isRight ? ChevronRight : ChevronLeft

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isRight ? 'Ver mais itens à direita' : 'Ver itens anteriores'}
      className={cn(
        'carousel-arrow absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full',
        'border border-primary/15 bg-white/95 text-primary shadow-[var(--shadow-card)]',
        'transition-all duration-200 hover:border-primary/25 hover:bg-white hover:shadow-[var(--shadow-card)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        isRight ? 'carousel-arrow--next' : 'carousel-arrow--prev',
        isRight ? 'carousel-arrow-right' : 'carousel-arrow-left',
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
    </button>
  )
}
