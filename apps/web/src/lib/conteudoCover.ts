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

const PRESET_CONTEUDO_COVER_URLS = new Set<string>([DEFAULT_CRONICA_COVER, DEFAULT_POEMA_COVER])

export function isPresetConteudoCoverUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  return Boolean(trimmed && PRESET_CONTEUDO_COVER_URLS.has(trimmed))
}

/** Capa ao criar conteúdo: preset só no tipo correspondente; não reaproveita capa de outro tipo. */
export function resolveCoverUrlForCreate(
  tipo: TipoConteudo,
  coverUrl: string | null,
  hasCoverFile: boolean,
): string | null {
  if (hasCoverFile) return coverUrl
  const preset = defaultConteudoCoverUrl(tipo)
  if (preset) return preset
  if (isPresetConteudoCoverUrl(coverUrl)) return null
  return coverUrl
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
