import { Linking } from 'react-native'
import { isYouTubeUrl } from '@/lib/youtube'

export function hasExternalVideoUrl(videoUrl: string | null | undefined): boolean {
  const url = videoUrl?.trim()
  if (!url) return false
  return isYouTubeUrl(url) || url.startsWith('http')
}

/** Abre o link do vídeo no app/navegador externo. */
export async function openVideoExternal(videoUrl: string | null | undefined): Promise<boolean> {
  const url = videoUrl?.trim()
  if (!url) return false
  try {
    await Linking.openURL(url)
    return true
  } catch {
    return false
  }
}
