import { Link, useNavigate } from '@tanstack/react-router'
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Play, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { getAppRouteForTipo } from '@/features/app/appNavigation'
import { spotlightDeckText, type SpotlightSlide } from '@/features/app/homeSpotlightSlides'
import { useHomeSpotlightSlides } from '@/features/app/useHomeSpotlightSlides'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { cn } from '@/lib/utils'

const AUTO_ADVANCE_MS = 8000

interface HomeSpotlightProps {
  userId: string | undefined
  className?: string
}

export function HomeSpotlight({ userId, className }: HomeSpotlightProps) {
  const { data: slides = [], isLoading } = useHomeSpotlightSlides(userId)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [captionKey, setCaptionKey] = useState(0)
  const [showCaption, setShowCaption] = useState(false)

  useEffect(() => {
    setActiveIndex(0)
    setShowCaption(false)
    setCaptionKey(0)
  }, [slides.length, slides[0]?.id])

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return
      setActiveIndex((index + slides.length) % slides.length)
      setCaptionKey((value) => value + 1)
      setShowCaption(true)
    },
    [slides.length],
  )

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (slides.length <= 1 || paused) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        setCaptionKey((value) => value + 1)
        setShowCaption(true)
        return (current + 1) % slides.length
      })
    }, AUTO_ADVANCE_MS)

    return () => window.clearInterval(timer)
  }, [slides.length, paused])

  useEffect(() => {
    if (slides.length === 0) return
    const reveal = window.setTimeout(() => {
      setShowCaption(true)
      setCaptionKey((value) => value + 1)
    }, 450)
    return () => window.clearTimeout(reveal)
  }, [slides.length, slides[0]?.id])

  if (isLoading) {
    return (
      <section className={cn('home-spotlight home-spotlight--loading', className)} aria-busy="true">
        <div className="home-spotlight__inner">
          <p className="flex items-center gap-2 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Carregando destaques…
          </p>
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    return (
      <section className={cn('home-spotlight home-spotlight--empty', className)}>
        <div className="home-spotlight__stage" data-tone="content">
          <div className="home-spotlight__inner home-spotlight__grid">
            <div className="home-spotlight__copy">
              <p className="home-spotlight__eyebrow">Catálogo EntreLinhas</p>
              <h2 className="home-spotlight__headline">Cadastre conteúdos para preencher o catálogo</h2>
              <p className="home-spotlight__deck">
                Livros, crônicas, poemas, músicas e vídeos aparecerão aqui conforme forem adicionados no
                painel administrativo.
              </p>
              <div className="home-spotlight__actions">
                <Link to="/app/livros" className="home-spotlight__cta home-spotlight__cta--primary">
                  Explorar catálogo
                </Link>
              </div>
            </div>
            <div className="home-spotlight__visual home-spotlight__visual--placeholder" aria-hidden>
              <BookOpen className="h-16 w-16 text-white/25" strokeWidth={1.25} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  const activeSlide = slides[activeIndex]!

  return (
    <section
      className={cn('home-spotlight home-spotlight--carousel', className)}
      aria-roledescription="carrossel"
      aria-label="Destaques do catálogo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false)
        }
      }}
    >
      <div className="home-spotlight__stage" data-tone={toneForSlide(activeSlide)}>
        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="home-spotlight__nav home-spotlight__nav--prev"
              onClick={goPrev}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </button>
            <button
              type="button"
              className="home-spotlight__nav home-spotlight__nav--next"
              onClick={goNext}
              aria-label="Próximo"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </button>
          </>
        )}

        <div className="home-spotlight__inner">
          <div className="home-spotlight__slides" aria-live="polite">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  'home-spotlight__slide',
                  index === activeIndex && 'home-spotlight__slide--active',
                )}
                aria-hidden={index !== activeIndex}
              >
                <SpotlightSlideView slide={slide} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCaption && (
        <div className="home-spotlight__caption-wrap" aria-live="polite">
          <p key={captionKey} className="home-spotlight__caption home-spotlight__caption--enter">
            <span className="home-spotlight__caption-badge">{activeSlide.badge}</span>
            <span className="home-spotlight__caption-title">{activeSlide.caption}</span>
          </p>
        </div>
      )}
    </section>
  )
}

function SpotlightSlideView({ slide }: { slide: SpotlightSlide }) {
  if (slide.kind === 'promo-new') {
    return <PromoNewSlide slide={slide} />
  }

  if (slide.kind === 'promo-video') {
    return <PromoVideoSlide slide={slide} />
  }

  return <ConteudoSlide slide={slide} />
}

function PromoNewSlide({ slide }: { slide: Extract<SpotlightSlide, { kind: 'promo-new' }> }) {
  const navigate = useNavigate()
  const { conteudo } = slide
  const coverUrl = resolveConteudoCoverUrl(conteudo)

  const open = () => {
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: conteudo.id } })
  }

  return (
    <div className="home-spotlight__grid">
      <div className="home-spotlight__copy">
        <p className="home-spotlight__eyebrow">{slide.badge}</p>
        <h2 className="home-spotlight__headline">{slide.headline}</h2>
        <p className="home-spotlight__author">{conteudo.titulo}</p>
        <p className="home-spotlight__deck">{slide.deck}</p>
        <div className="home-spotlight__actions">
          <button type="button" onClick={open} className="home-spotlight__cta home-spotlight__cta--primary">
            Ver novidade
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={open}
        className="home-spotlight__visual group home-spotlight__visual--promo"
        aria-label={`Abrir ${conteudo.titulo}`}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="home-spotlight__cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="home-spotlight__cover home-spotlight__cover--fallback">
            <Sparkles className="h-14 w-14 text-white/35" strokeWidth={1.25} aria-hidden />
          </div>
        )}
        <span className="home-spotlight__promo-tag">Novo</span>
      </button>
    </div>
  )
}

function PromoVideoSlide({ slide }: { slide: Extract<SpotlightSlide, { kind: 'promo-video' }> }) {
  const navigate = useNavigate()
  const { video, anchor } = slide
  const coverUrl = resolveConteudoCoverUrl(video)

  const scrollToStrip = () => {
    document.getElementById(`section-videos-${anchor}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openVideo = () => {
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: video.id } })
  }

  return (
    <div className="home-spotlight__grid">
      <div className="home-spotlight__copy">
        <p className="home-spotlight__eyebrow">{slide.badge}</p>
        <h2 className="home-spotlight__headline">{slide.headline}</h2>
        <p className="home-spotlight__deck">{slide.deck}</p>
        <div className="home-spotlight__actions">
          <button
            type="button"
            onClick={scrollToStrip}
            className="home-spotlight__cta home-spotlight__cta--primary"
          >
            Ir para os vídeos
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" onClick={openVideo} className="home-spotlight__cta home-spotlight__cta--ghost">
            Assistir agora
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={openVideo}
        className="home-spotlight__visual group home-spotlight__visual--video"
        aria-label={`Assistir ${video.titulo}`}
      >
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt=""
              className="home-spotlight__cover home-spotlight__cover--video transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
            <span className="home-spotlight__play-badge" aria-hidden>
              <Play className="h-6 w-6 fill-white text-white" />
            </span>
          </>
        ) : (
          <div className="home-spotlight__cover home-spotlight__cover--fallback">
            <Play className="h-14 w-14 text-white/30" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </button>
    </div>
  )
}

function ConteudoSlide({ slide }: { slide: Extract<SpotlightSlide, { kind: 'content' }> }) {
  const navigate = useNavigate()
  const { conteudo, badge, isContinueReading } = slide
  const coverUrl = resolveConteudoCoverUrl(conteudo)
  const catalogRoute = getAppRouteForTipo(conteudo.tipo)
  const isVideo = conteudo.tipo === 'video'

  const open = () => {
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: conteudo.id } })
  }

  const primaryLabel = isContinueReading
    ? 'Continuar leitura'
    : isVideo
      ? 'Assistir agora'
      : 'Abrir conteúdo'

  return (
    <div className="home-spotlight__grid">
      <div className="home-spotlight__copy">
        <p className="home-spotlight__eyebrow">{badge}</p>
        <h2 className="home-spotlight__headline">{conteudo.titulo}</h2>
        {conteudo.autor && <p className="home-spotlight__author">{conteudo.autor}</p>}
        <p className="home-spotlight__deck">{spotlightDeckText(slide)}</p>
        <div className="home-spotlight__actions">
          <button type="button" onClick={open} className="home-spotlight__cta home-spotlight__cta--primary">
            {primaryLabel}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <Link to={catalogRoute} className="home-spotlight__cta home-spotlight__cta--ghost">
            Ver seção
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={open}
        className={cn('home-spotlight__visual group', isVideo && 'home-spotlight__visual--video')}
        aria-label={`Abrir ${conteudo.titulo}`}
      >
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt=""
              className={cn(
                'home-spotlight__cover transition-transform duration-300 group-hover:scale-[1.02]',
                isVideo && 'home-spotlight__cover--video',
              )}
              loading={isContinueReading ? 'eager' : 'lazy'}
              decoding="async"
            />
            {isVideo && (
              <span className="home-spotlight__play-badge" aria-hidden>
                <Play className="h-6 w-6 fill-white text-white" />
              </span>
            )}
          </>
        ) : (
          <div className="home-spotlight__cover home-spotlight__cover--fallback">
            <BookOpen className="h-14 w-14 text-white/30" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </button>
    </div>
  )
}

function toneForSlide(slide: SpotlightSlide): string {
  if (slide.kind === 'promo-new') return 'teal'
  if (slide.kind === 'promo-video') return 'warm'

  const tones: Record<string, string> = {
    livro: 'content',
    cronica: 'ink',
    musica: 'teal',
    poema: 'gold',
    video: 'warm',
    frase: 'content',
    outro: 'content',
  }
  return tones[slide.conteudo.tipo] ?? 'content'
}
