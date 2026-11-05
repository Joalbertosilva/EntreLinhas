import { Image } from 'react-native'
import { getWebAppUrl } from '@/lib/webAppUrl'

/** Mesmos paths que `apps/web/public/images` — empacotados no app (sem depender do Metro `/images`). */
const BUNDLED_PUBLIC_IMAGES: Record<string, number> = {
  '/images/cronica-default-cover.png': require('../../assets/images/cronica-default-cover.png'),
  '/images/poema-default-cover.png': require('../../assets/images/poema-default-cover.png'),
  '/images/minha-obra-default-cover.png': require('../../assets/images/minha-obra-default-cover.png'),
  '/images/obra-default-cover.png': require('../../assets/images/obra-default-cover.png'),
}

function bundledAssetUri(moduleId: number): string | undefined {
  return Image.resolveAssetSource(moduleId)?.uri
}

function normalizePublicPath(url: string): string {
  const trimmed = url.trim()
  const webBase = getWebAppUrl()
  if (trimmed.startsWith(webBase)) {
    const path = trimmed.slice(webBase.length)
    return path.startsWith('/') ? path : `/${path}`
  }
  return trimmed
}

/**
 * Converte URL absoluta, path `/images/...` ou URL do site em URI carregável no dispositivo.
 * Paths relativos não podem ir direto ao Metro (pasta `apps/mobile/images` inexistente).
 */
export function resolvePublicImageUri(url: string | null | undefined): string | undefined {
  if (!url?.trim()) return undefined

  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    const pathKey = normalizePublicPath(trimmed)
    const bundledWeb = BUNDLED_PUBLIC_IMAGES[pathKey]
    if (bundledWeb != null) return bundledAssetUri(bundledWeb)
    return trimmed
  }

  const pathKey = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const bundledPath = BUNDLED_PUBLIC_IMAGES[pathKey]
  if (bundledPath != null) return bundledAssetUri(bundledPath)

  if (pathKey.startsWith('/')) return `${getWebAppUrl()}${pathKey}`
  return trimmed
}

/** URI de capa com cache-bust para o expo-image não reutilizar arquivo antigo no mesmo path. */
export function capaImageUri(
  url: string | null | undefined,
  cacheKey?: string | number | null,
): string | undefined {
  const resolved = resolvePublicImageUri(url)
  if (!resolved) return undefined
  if (/[?&]v=/.test(resolved)) return resolved
  if (cacheKey != null && cacheKey !== '') {
    const sep = resolved.includes('?') ? '&' : '?'
    return `${resolved}${sep}v=${encodeURIComponent(String(cacheKey))}`
  }
  return resolved
}
