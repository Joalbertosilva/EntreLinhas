import { Link } from '@tanstack/react-router'
import { ChevronRight, Play } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { CatalogAnchor } from '@tcc-sistema/types'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { hasExternalVideoUrl, openVideoExternal } from '@/lib/openVideoUrl'
import { cn } from '@/lib/utils'

const ANCHOR_COPY: Record<
  CatalogAnchor,
  { eyebrow: string; title: string; featuredLabel: string }
> = {
  livros: {
    eyebrow: 'Assistir agora',
    title: 'Vídeos sobre leitura',
    featuredLabel: 'Leitura',
  },
  cronicas: {
    eyebrow: 'Assistir agora',
    title: 'Vídeos sobre crônicas',
    featuredLabel: 'Crônica',
  },
  musicas: {
    eyebrow: 'Assistir agora',
    title: 'Vídeos sobre música',
    featuredLabel: 'Música',
  },
  poemas: {
    eyebrow: 'Assistir agora',
    title: 'Vídeos sobre poesia',
    featuredLabel: 'Poema',
  },
}

interface CatalogVideoStripProps {
  anchor: CatalogAnchor
  videos: ConteudoCardData[]
  className?: string
}

/** Bloco editorial de vídeos abaixo de cada seção — destaque principal + lista lateral. */
export function CatalogVideoStrip({ anchor, videos, className }: CatalogVideoStripProps) {
  const playable = useMemo(
    () => videos.filter((video) => hasExternalVideoUrl(video.video_url)),
    [videos],
  )

  const [featuredId, setFeaturedId] = useState<string | null>(playable[0]?.id ?? null)

  useEffect(() => {
    if (playable.length === 0) {
      setFeaturedId(null)
      return
    }
    if (!playable.some((video) => video.id === featuredId)) {
      setFeaturedId(playable[0]!.id)
    }
  }, [featuredId, playable])

  const featuredIndex = playable.findIndex((video) => video.id === featuredId)
  const safeFeaturedIndex = featuredIndex >= 0 ? featuredIndex : 0
  const featured = playable[safeFeaturedIndex]

  const sidebar = playable.filter((_, index) => index !== safeFeaturedIndex).slice(0, 3)

  if (!featured) return null

  const copy = ANCHOR_COPY[anchor]

  return (
    <section
      id={`section-videos-${anchor}`}
      className={cn('catalog-video-showcase scroll-mt-28', className)}
      aria-labelledby={`catalog-video-showcase-${anchor}-title`}
      data-anchor={anchor}
    >
      <div className="catalog-video-showcase__inner">
        <header className="catalog-video-showcase__head">
          <div>
            <p className="catalog-video-showcase__eyebrow">{copy.eyebrow}</p>
            <h3 id={`catalog-video-showcase-${anchor}-title`} className="catalog-video-showcase__title">
              {copy.title}
            </h3>
          </div>
          <Link to="/app/videos" className="catalog-video-showcase__more">
            Ver todos
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </header>

        <div className="catalog-video-showcase__layout">
          <FeaturedVideo
            video={featured}
            label={featured.video_categoria ?? copy.featuredLabel}
            onOpen={() => openVideoExternal(featured.video_url)}
          />

          {sidebar.length > 0 && (
            <ul className="catalog-video-showcase__sidebar" aria-label="Outros vídeos desta seção">
              {sidebar.map((video) => (
                <li key={video.id}>
                  <SidebarVideo
                    video={video}
                    onSelect={() => setFeaturedId(video.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function FeaturedVideo({
  video,
  label,
  onOpen,
}: {
  video: ConteudoCardData
  label: string
  onOpen: () => void
}) {
  const coverUrl = resolveConteudoCoverUrl(video)

  return (
    <article key={video.id} className="catalog-video-featured">
      <button
        type="button"
        onClick={onOpen}
        className="catalog-video-featured__hit"
        aria-label={`Assistir ${video.titulo} no YouTube`}
      >
        <div className="catalog-video-featured__media">
          {coverUrl ? (
            <img src={coverUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="catalog-video-featured__fallback" aria-hidden />
          )}
          <span className="catalog-video-featured__play" aria-hidden>
            <Play className="h-7 w-7 fill-white text-white" />
          </span>
        </div>
      </button>

      <div className="catalog-video-featured__meta">
        <p className="catalog-video-featured__label">{label}</p>
        <h4 className="catalog-video-featured__name">{video.titulo}</h4>
        {video.autor && <p className="catalog-video-featured__author">{video.autor}</p>}
        <button type="button" onClick={onOpen} className="catalog-video-featured__cta">
          Assistir no YouTube
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </article>
  )
}

function SidebarVideo({
  video,
  onSelect,
}: {
  video: ConteudoCardData
  onSelect: () => void
}) {
  const coverUrl = resolveConteudoCoverUrl(video)

  return (
    <button
      type="button"
      onClick={onSelect}
      className="catalog-video-sidebar__hit"
      aria-label={`Destacar ${video.titulo}`}
    >
      <div className="catalog-video-sidebar__thumb">
        {coverUrl ? (
          <img src={coverUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="catalog-video-sidebar__fallback" aria-hidden />
        )}
        <span className="catalog-video-sidebar__play" aria-hidden>
          <Play className="h-3.5 w-3.5 fill-white text-white" />
        </span>
        <span className="catalog-video-sidebar__title">{video.titulo}</span>
      </div>
    </button>
  )
}
