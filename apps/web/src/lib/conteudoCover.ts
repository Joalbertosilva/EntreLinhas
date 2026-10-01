import type { TipoConteudo } from '@tcc-sistema/types'
import { extractYouTubeId, youtubeThumbnailUrl } from '@/lib/youtube'

interface ConteudoCoverSource {
  capa_url?: string | null
  video_url?: string | null
  tipo?: TipoConteudo
}

export const DEFAULT_CRONICA_COVER = '/images/cronica-default-cover.png'
export const DEFAULT_POEMA_COVER = '/images/poema-default-cover.png'

const DEFAULT_BY_TIPO: Partial<Record<TipoConteudo, string>> = {
  cronica: DEFAULT_CRONICA_COVER,
  poema: DEFAULT_POEMA_COVER,
}

/** Capa padrão por tipo (crônica/poema) — usada na criação e na exibição. */
export function defaultConteudoCoverUrl(tipo: TipoConteudo): string | null {
  return DEFAULT_BY_TIPO[tipo] ?? null
}

/** Capa manual, thumbnail YouTube ou capa padrão do tipo. */
export function resolveConteudoCoverUrl(conteudo: ConteudoCoverSource): string | null {
  if (conteudo.capa_url?.trim()) return conteudo.capa_url

  if (conteudo.video_url) {
    const videoId = extractYouTubeId(conteudo.video_url)
    if (videoId) return youtubeThumbnailUrl(videoId)
  }

  if (conteudo.tipo) {
    return defaultConteudoCoverUrl(conteudo.tipo)
  }

  return null
}
