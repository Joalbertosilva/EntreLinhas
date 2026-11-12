import { isDefaultObraCoverUrl } from '@tcc-sistema/cover-motifs'
import { DEFAULT_OBRA_COVER } from '@/lib/obraCover'
import { withCacheBust } from '@/lib/storage'

export function obraCapaImageSrc(
  capaUrl: string | null | undefined,
  updatedAt?: string | null,
): string {
  if (!capaUrl?.trim() || isDefaultObraCoverUrl(capaUrl)) return DEFAULT_OBRA_COVER
  return withCacheBust(capaUrl.trim(), updatedAt ?? undefined)
}
