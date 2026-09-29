/** Extrai ID de URLs comuns do YouTube. */
export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0]
      return id || null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }
      const embedMatch = /^\/embed\/([^/?]+)/.exec(parsed.pathname)
      if (embedMatch?.[1]) return embedMatch[1]
      const shortsMatch = /^\/shorts\/([^/?]+)/.exec(parsed.pathname)
      if (shortsMatch?.[1]) return shortsMatch[1]
    }
  } catch {
    return null
  }

  return null
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) != null
}
