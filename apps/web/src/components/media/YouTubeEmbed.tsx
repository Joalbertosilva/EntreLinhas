import { Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'
import { extractYouTubeId, youtubeEmbedUrl } from '@/lib/youtube'
import { cn } from '@/lib/utils'

interface YouTubeEmbedProps {
  url: string
  title: string
  className?: string
  /** Permite alternar entre player compacto e largura total */
  allowSizeToggle?: boolean
  defaultSize?: 'compact' | 'full'
}

export function YouTubeEmbed({
  url,
  title,
  className,
  allowSizeToggle = false,
  defaultSize = 'compact',
}: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url)
  const [size, setSize] = useState<'compact' | 'full'>(defaultSize)

  if (!videoId) return null

  const isCompact = size === 'compact'

  return (
    <div className={cn('youtube-embed-wrap space-y-2', className)}>
      {allowSizeToggle && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSize(isCompact ? 'full' : 'compact')}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-primary-light/40"
          >
            {isCompact ? (
              <>
                <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                Tela cheia
              </>
            ) : (
              <>
                <Minimize2 className="h-3.5 w-3.5" aria-hidden />
                Player menor
              </>
            )}
          </button>
        </div>
      )}

      <div
        className={cn(
          'youtube-embed aspect-video overflow-hidden rounded-xl bg-black',
          isCompact ? 'youtube-embed--compact mx-auto w-full max-w-xl' : 'w-full',
        )}
      >
        <iframe
          src={youtubeEmbedUrl(videoId)}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  )
}
