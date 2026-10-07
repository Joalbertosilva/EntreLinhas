import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'

interface HomeCoverShelfProps {
  title: string
  subtitle?: string
  conteudos: ConteudoCardData[]
  /** Faixa escura estilo vitrine editorial */
  tone?: 'dark' | 'light'
  viewAllTo?: string
  className?: string
}

const SCROLL_STEP = 280

export function HomeCoverShelf({
  title,
  subtitle,
  conteudos,
  tone = 'dark',
  viewAllTo,
  className,
}: HomeCoverShelfProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const contentKey = useMemo(
    () => conteudos.map((item) => item.id).join(','),
    [conteudos],
  )

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < maxScroll - 8)
  }, [])

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
    trackRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  if (conteudos.length === 0) return null

  const isDark = tone === 'dark'

  return (
    <section
      className={cn('home-cover-shelf', isDark && 'home-cover-shelf--dark', className)}
      aria-labelledby={`cover-shelf-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="home-cover-shelf__inner">
        <div className="home-cover-shelf__head">
          <div className="min-w-0">
            <div className="section-head-inline">
              <h2
                id={`cover-shelf-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="home-cover-shelf__title"
              >
                {title}
              </h2>
              {viewAllTo && (
                <Link to={viewAllTo} className="home-cover-shelf__view-all">
                  Ver tudo
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
            {subtitle && <p className="home-cover-shelf__subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="home-cover-shelf__carousel">
          {canScrollLeft && (
            <ShelfArrow direction="left" dark={isDark} onClick={() => scrollByStep('left')} />
          )}
          {canScrollRight && (
            <ShelfArrow direction="right" dark={isDark} onClick={() => scrollByStep('right')} />
          )}

          <div ref={trackRef} className="home-cover-shelf__track" role="list">
            {conteudos.map((conteudo) => (
              <CoverShelfItem key={conteudo.id} conteudo={conteudo} dark={isDark} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CoverShelfItem({
  conteudo,
  dark,
}: {
  conteudo: ConteudoCardData
  dark: boolean
}) {
  const navigate = useNavigate()

  const open = () => {
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: conteudo.id } })
  }

  return (
    <article role="listitem" className={cn('cover-shelf-item', dark && 'cover-shelf-item--dark')}>
      <button type="button" onClick={open} className="cover-shelf-item__hit" aria-label={`Abrir ${conteudo.titulo}`}>
        <div className="cover-shelf-item__cover">
          {conteudo.capa_url ? (
            <img src={conteudo.capa_url} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="cover-shelf-item__cover-fallback" aria-hidden />
          )}
        </div>
        <div className="cover-shelf-item__meta">
          <p className="cover-shelf-item__tipo">{TIPO_CONTEUDO_LABEL[conteudo.tipo]}</p>
          <p className="cover-shelf-item__titulo">{conteudo.titulo}</p>
          {conteudo.autor && <p className="cover-shelf-item__autor">{conteudo.autor}</p>}
        </div>
      </button>
    </article>
  )
}

function ShelfArrow({
  direction,
  dark,
  onClick,
}: {
  direction: 'left' | 'right'
  dark: boolean
  onClick: () => void
}) {
  const isRight = direction === 'right'
  const Icon = isRight ? ChevronRight : ChevronLeft

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isRight ? 'Ver mais à direita' : 'Ver anteriores'}
      className={cn(
        'cover-shelf-arrow',
        dark && 'cover-shelf-arrow--dark',
        isRight ? 'cover-shelf-arrow--right' : 'cover-shelf-arrow--left',
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden />
    </button>
  )
}
