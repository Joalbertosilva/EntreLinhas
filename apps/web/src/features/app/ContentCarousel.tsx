import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AppSectionId } from '@/features/app/appNavigation'
import type { HomeSectionConfig } from '@/features/app/homeSections'
import { ContentCard } from '@/features/app/ContentCard'
import { ContentCardPlaceholder } from '@/features/app/ContentCardPlaceholder'
import { SectionIcon } from '@/features/app/SectionIcon'
import {
  countPlaceholders,
  useSectionConteudos,
} from '@/features/app/useConteudos'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ContentCarouselProps {
  section: HomeSectionConfig
  showViewAll?: boolean
}

const SECTION_ICON: Partial<Record<string, AppSectionId>> = {
  destaques: 'home',
  livros: 'livros',
  cronicas: 'cronicas',
  musicas: 'musicas',
  poemas: 'poemas',
}

const SCROLL_STEP = 300

export function ContentCarousel({ section, showViewAll = true }: ContentCarouselProps) {
  const isDestaques = section.id === 'destaques'
  const { data: conteudos = [], isLoading, isError } = useSectionConteudos(section)
  const hasRealContent = conteudos.length > 0

  const placeholderCount = useMemo(
    () => (isLoading ? section.placeholderCount : countPlaceholders(conteudos.length, section.placeholderCount)),
    [conteudos.length, isLoading, section.placeholderCount],
  )

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
  }, [conteudos.length, placeholderCount, updateScrollState])

  const scrollByStep = (direction: 'left' | 'right') => {
    trackRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  return (
    <section className="space-y-3" aria-labelledby={`section-${section.id}`}>
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <SectionIcon section={iconSection} size="sm" className="mt-0.5 shadow-none" />
          <div className="min-w-0">
            <h2
              id={`section-${section.id}`}
              className="text-lg font-semibold tracking-tight text-brand-navy sm:text-xl"
            >
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="mt-0.5 text-sm text-text-muted">{section.subtitle}</p>
            )}
          </div>
        </div>
        {showViewAll && section.route && (
          <Link to={section.route} className="hidden shrink-0 sm:block">
            <Button variant="ghost" size="sm" className="text-text-muted hover:text-primary">
              Ver tudo
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        )}
      </div>

      {isError && (
        <p className="text-sm text-error">
          Não foi possível carregar os conteúdos desta seção. Tente recarregar a página.
        </p>
      )}

      {!isLoading && !isError && !hasRealContent && section.id === 'destaques' && (
        <p className="text-sm text-text-muted">
          Os destaques mostram os conteúdos mais curtidos pelos alunos. Cadastre materiais e,
          conforme os alunos curtirem, eles aparecerão aqui.
        </p>
      )}

      {!isLoading && !isError && !hasRealContent && section.id !== 'destaques' && (
        <p className="text-sm text-text-muted">
          Nenhum conteúdo ativo aqui ainda. Os cards tracejados abaixo são apenas decorativos.
        </p>
      )}

      <div
        className={cn(
          'content-carousel relative',
          canScrollRight && 'content-carousel-fade-right',
          canScrollLeft && 'content-carousel-fade-left',
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
            <ContentCard key={conteudo.id} conteudo={conteudo} showTipo={isDestaques} />
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
        isRight ? 'right-0 sm:right-1' : 'left-0 sm:left-1',
        isRight ? 'carousel-arrow-right' : 'carousel-arrow-left',
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
    </button>
  )
}
