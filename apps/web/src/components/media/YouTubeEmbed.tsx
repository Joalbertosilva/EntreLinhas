import { extractYouTubeId, youtubeEmbedUrl } from '@/lib/youtube'
import { cn } from '@/lib/utils'

interface YouTubeEmbedProps {
  url: string
  title: string
  className?: string
}

export function YouTubeEmbed({ url, title, className }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null

  return (
    <div className={cn('youtube-embed aspect-video w-full overflow-hidden rounded-xl bg-black', className)}>
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
  )
}
