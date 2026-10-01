import { isYouTubeUrl } from '@/lib/youtube'

/** Abre o link do vídeo em nova aba (YouTube ou URL externa cadastrada). */
export function openVideoExternal(videoUrl: string | null | undefined): boolean {
  const url = videoUrl?.trim()
  if (!url) return false
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

export function hasExternalVideoUrl(videoUrl: string | null | undefined): boolean {
  const url = videoUrl?.trim()
  if (!url) return false
  return isYouTubeUrl(url) || url.startsWith('http')
}
