/** URI de capa com cache-bust para o expo-image não reutilizar arquivo antigo no mesmo path. */
export function capaImageUri(
  url: string | null | undefined,
  cacheKey?: string | number | null,
): string | undefined {
  if (!url) return undefined
  if (/[?&]v=/.test(url)) return url
  if (cacheKey != null && cacheKey !== '') {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}v=${encodeURIComponent(String(cacheKey))}`
  }
  return url
}
