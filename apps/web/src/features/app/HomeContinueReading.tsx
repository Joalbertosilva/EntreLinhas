import { useNavigate } from '@tanstack/react-router'
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

const SCROLL_STEP = 148

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
    trackRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  if (isLoading) {
    return (
      <div className="home-continue-shelf home-continue-shelf--loading" aria-busy="true">
        <p className="flex items-center gap-2 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Carregando leituras em andamento…
        </p>
      </div>
    )
  }

  if (conteudos.length === 0) return null

  return (
    <section className="home-continue-shelf" aria-labelledby="home-continue-reading-title">
      <div className="home-continue-shelf__head">
        <h2 id="home-continue-reading-title" className="home-continue-shelf__title">
          Continue lendo
        </h2>
        <p className="home-continue-shelf__subtitle">Retome de onde parou</p>
      </div>

      <div className="home-continue-shelf__panel">
        {canScrollLeft && (
          <ContinueShelfArrow direction="left" onClick={() => scrollByStep('left')} />
        )}
        {canScrollRight && (
          <ContinueShelfArrow direction="right" onClick={() => scrollByStep('right')} />
        )}

        <div className="home-continue-shelf__viewport">
          <div ref={trackRef} className="home-continue-shelf__track" role="list">
            {conteudos.map((conteudo) => (
              <ContinueShelfItem key={conteudo.id} conteudo={conteudo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ContinueShelfItem({ conteudo }: { conteudo: ConteudoCardData }) {
  const navigate = useNavigate()
  const coverUrl = resolveConteudoCoverUrl(conteudo)

  const open = () => {
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: conteudo.id } })
  }

  return (
    <article role="listitem" className="home-continue-shelf__item">
      <button type="button" onClick={open} className="home-continue-shelf__hit">
        <div className="home-continue-shelf__cover">
          {coverUrl ? (
            <img src={coverUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="home-continue-shelf__cover-fallback" aria-hidden />
          )}
          <span className="home-continue-shelf__badge">Lendo</span>
        </div>
        <div className="home-continue-shelf__meta">
          <p className="home-continue-shelf__tipo">{TIPO_CONTEUDO_LABEL[conteudo.tipo]}</p>
          <p className="home-continue-shelf__titulo">{conteudo.titulo}</p>
          {conteudo.autor && <p className="home-continue-shelf__autor">{conteudo.autor}</p>}
        </div>
      </button>
    </article>
  )
}

function ContinueShelfArrow({
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
        'home-continue-shelf__arrow',
        isRight ? 'home-continue-shelf__arrow--right' : 'home-continue-shelf__arrow--left',
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden />
    </button>
  )
}
