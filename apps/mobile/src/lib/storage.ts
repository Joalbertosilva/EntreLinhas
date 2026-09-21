import { supabase } from '@/lib/supabase'

const COVERS_BUCKET = 'covers'
const MAX_BYTES = 5 * 1024 * 1024

export function validateCoverUri(fileSize: number | undefined, mimeType: string | undefined): string | null {
  const type = (mimeType ?? '').toLowerCase()
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (type && !allowed.includes(type)) return 'Use JPG, PNG ou WebP'
  if (fileSize != null && fileSize > MAX_BYTES) return 'A imagem deve ter no máximo 5 MB'
  return null
}

function extFromMime(mime: string | undefined): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

export async function uploadObraCoverFromUri(
  uri: string,
  userId: string,
  obraId: string,
  mimeType = 'image/jpeg',
  fileSize?: number,
): Promise<string> {
  const validation = validateCoverUri(fileSize, mimeType)
  if (validation) throw new Error(validation)

  const response = await fetch(uri)
  const blob = await response.blob()
  const ext = extFromMime(mimeType)
  const path = `obras/${userId}/${obraId}/capa.${ext}`

  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: mimeType || 'image/jpeg',
    cacheControl: '3600',
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}
