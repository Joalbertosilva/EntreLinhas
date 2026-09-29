import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronRight, Play, Video } from 'lucide-react'
import type { CatalogAnchor } from '@tcc-sistema/types'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { cn } from '@/lib/utils'

const ANCHOR_COPY: Record<CatalogAnchor, { title: string; subtitle: string }> = {
  livros: {
    title: 'Vídeos sobre leitura',
    subtitle: 'Reflexões em vídeo para complementar os livros',
  },
  cronicas: {
    title: 'Vídeos sobre crônicas',
    subtitle: 'Conteúdos em vídeo relacionados a textos curtos',
  },
  musicas: {
    title: 'Vídeos sobre música',
    subtitle: 'Letras, arte e contexto sonoro',
  },
  poemas: {
    title: 'Vídeos sobre poesia',
    subtitle: 'Versos e interpretações em audiovisual',
  },
}

interface CatalogVideoStripProps {
  anchor: CatalogAnchor
  videos: ConteudoCardData[]
  className?: string
}

/** Faixa de vídeos inserida logo abaixo de uma seção do catálogo na home. */
export function CatalogVideoStrip({ anchor, videos, className }: CatalogVideoStripProps) {
  if (videos.length === 0) return null

  const copy = ANCHOR_COPY[anchor]

  return (
    <section
      id={`section-videos-${anchor}`}
      className={cn('catalog-video-strip scroll-mt-28', className)}
      aria-labelledby={`catalog-video-strip-${anchor}-title`}
    >
      <div className="catalog-video-strip__head">
        <div className="flex min-w-0 items-start gap-3">
          <span className="catalog-video-strip__icon" aria-hidden>
            <Video className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3
              id={`catalog-video-strip-${anchor}-title`}
              className="catalog-video-strip__title"
            >
              {copy.title}
            </h3>
            <p className="catalog-video-strip__subtitle">{copy.subtitle}</p>
          </div>
        </div>
        <Link to="/app/videos" className="catalog-video-strip__link">
          Ver todos
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="catalog-video-strip__track" role="list">
        {videos.map((video) => (
          <CatalogVideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  )
}

function CatalogVideoCard({ video }: { video: ConteudoCardData }) {
  const navigate = useNavigate()
  const coverUrl = resolveConteudoCoverUrl(video)

  const open = () => {
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: video.id } })
  }

  return (
    <article role="listitem" className="catalog-video-card">
      <button type="button" onClick={open} className="catalog-video-card__hit">
        <div className="catalog-video-card__thumb">
          {coverUrl ? (
            <img src={coverUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="catalog-video-card__thumb-fallback" aria-hidden>
              <Video className="h-8 w-8 text-white/40" />
            </div>
          )}
          <span className="catalog-video-card__play" aria-hidden>
            <Play className="h-4 w-4 fill-white text-white" />
          </span>
        </div>
        <div className="catalog-video-card__body">
          {video.video_categoria && (
            <p className="catalog-video-card__cat">{video.video_categoria}</p>
          )}
          <p className="catalog-video-card__title">{video.titulo}</p>
          {video.autor && <p className="catalog-video-card__author">{video.autor}</p>}
        </div>
      </button>
    </article>
  )
}
