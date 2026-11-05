import type { TipoConteudo } from '@tcc-sistema/types'
import { resolvePublicImageUri } from '@/lib/imageUrl'
import { extractYouTubeId, youtubeThumbnailUrl } from '@/lib/youtube'

interface ConteudoCoverSource {
  capa_url?: string | null
  video_url?: string | null
  tipo?: TipoConteudo
}

const DEFAULT_PATH_BY_TIPO: Partial<Record<TipoConteudo, string>> = {
  cronica: '/images/cronica-default-cover.png',
  poema: '/images/poema-default-cover.png',
}

export function defaultConteudoCoverUrl(tipo: TipoConteudo): string | null {
  const path = DEFAULT_PATH_BY_TIPO[tipo]
  if (!path) return null
  return resolvePublicImageUri(path) ?? null
}

/** Capa manual, thumbnail YouTube ou capa padrão do tipo. */
export function resolveConteudoCoverUrl(conteudo: ConteudoCoverSource): string | null {
  if (conteudo.capa_url?.trim()) {
    return resolvePublicImageUri(conteudo.capa_url) ?? null
  }

  if (conteudo.video_url) {
    const videoId = extractYouTubeId(conteudo.video_url)
    if (videoId) return youtubeThumbnailUrl(videoId)
  }

  if (conteudo.tipo) {
    return defaultConteudoCoverUrl(conteudo.tipo)
  }

  return null
}
