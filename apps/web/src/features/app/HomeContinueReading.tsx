import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { useHomeContinueReading } from '@/features/app/useHomeContinueReading'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'

interface HomeContinueReadingProps {
  userId: string | undefined
}

export function HomeContinueReading({ userId }: HomeContinueReadingProps) {
  const { data: conteudos = [], isLoading } = useHomeContinueReading(userId)
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const contentKey = useMemo(() => conteudos.map((item) => item.id).join(','), [conteudos])

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 6)
    setCanScrollRight(el.scrollLeft < maxScroll - 6)
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
    const el = trackRef.current
    if (!el) return
    const step = Math.max(el.clientWidth * 0.75, 220)
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  if (isLoading) {
    return (
      <div className="home-continue-strip home-continue-strip--loading" aria-busy="true">
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
          Carregando leituras em andamento…
        </p>
      </div>
    )
  }

  if (conteudos.length === 0) return null

  return (
    <section className="home-continue-strip" aria-labelledby="home-continue-reading-title">
      <div className="home-continue-strip__head">
        <div>
          <h2 id="home-continue-reading-title" className="home-continue-strip__title">
            Continue lendo
          </h2>
          <p className="home-continue-strip__subtitle">Retome de onde parou</p>
        </div>
        <Link to="/app/minhas-leituras" className="home-continue-strip__link">
          Minhas leituras
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div
        className={cn(
          'home-continue-strip__rail',
          canScrollRight && 'home-continue-strip__rail--fade-right',
          canScrollLeft && 'home-continue-strip__rail--fade-left',
        )}
      >
        {canScrollLeft && (
          <ContinueStripArrow direction="left" onClick={() => scrollByStep('left')} />
        )}
        {canScrollRight && (
          <ContinueStripArrow direction="right" onClick={() => scrollByStep('right')} />
        )}

        <div ref={trackRef} className="home-continue-strip__track" role="list">
          {conteudos.map((conteudo) => (
            <ContinueStripCard key={conteudo.id} conteudo={conteudo} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ContinueStripCard({ conteudo }: { conteudo: ConteudoCardData }) {
  const navigate = useNavigate()
  const coverUrl = resolveConteudoCoverUrl(conteudo)

  const open = () => {
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: conteudo.id } })
  }

  return (
    <article role="listitem" className="home-continue-strip__card">
      <button type="button" onClick={open} className="home-continue-strip__hit">
        <div className="home-continue-strip__cover">
          {coverUrl ? (
            <img src={coverUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="home-continue-strip__cover-fallback" aria-hidden />
          )}
        </div>

        <div className="home-continue-strip__body">
          <div className="home-continue-strip__labels">
            <span className="home-continue-strip__status">Em andamento</span>
            <span className="home-continue-strip__tipo">{TIPO_CONTEUDO_LABEL[conteudo.tipo]}</span>
          </div>
          <p className="home-continue-strip__titulo">{conteudo.titulo}</p>
          {conteudo.autor && <p className="home-continue-strip__autor">{conteudo.autor}</p>}
        </div>

        <ChevronRight className="home-continue-strip__chev" strokeWidth={2} aria-hidden />
      </button>
    </article>
  )
}

function ContinueStripArrow({
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
      aria-label={isRight ? 'Ver mais obras em andamento' : 'Ver obras anteriores'}
      className={cn(
        'home-continue-strip__arrow',
        isRight ? 'home-continue-strip__arrow--right' : 'home-continue-strip__arrow--left',
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden />
    </button>
  )
}
