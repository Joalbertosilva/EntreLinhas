import { extractYouTubeId, youtubeThumbnailUrl } from '@/lib/youtube'

interface ConteudoCoverSource {
  capa_url?: string | null
  video_url?: string | null
}

/** Capa manual ou thumbnail automática do YouTube. */
export function resolveConteudoCoverUrl(conteudo: ConteudoCoverSource): string | null {
  if (conteudo.capa_url?.trim()) return conteudo.capa_url

  if (conteudo.video_url) {
    const videoId = extractYouTubeId(conteudo.video_url)
    if (videoId) return youtubeThumbnailUrl(videoId)
  }

  return null
}
