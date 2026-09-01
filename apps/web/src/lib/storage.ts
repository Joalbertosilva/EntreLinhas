import { supabase } from '@/lib/supabase'

const COVERS_BUCKET = 'covers'
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export function validateCoverFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Use JPG, PNG ou WebP'
  }
  if (file.size > MAX_BYTES) {
    return 'A imagem deve ter no máximo 5 MB'
  }
  return null
}

export function extractCoverStoragePath(url: string): string | null {
  const patterns = [
    `/storage/v1/object/public/${COVERS_BUCKET}/`,
    `/storage/v1/object/sign/${COVERS_BUCKET}/`,
    `/storage/v1/object/${COVERS_BUCKET}/`,
  ]
  for (const marker of patterns) {
    const idx = url.indexOf(marker)
    if (idx !== -1) {
      return decodeURIComponent(url.slice(idx + marker.length).split('?')[0] ?? '')
    }
  }
  return null
}

export async function uploadCover(file: File, contentId: string): Promise<string> {
  const validation = validateCoverFile(file)
  if (validation) throw new Error(validation)

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${contentId}/capa.${ext}`

  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadObraCover(
  file: File,
  userId: string,
  obraId: string,
): Promise<string> {
  const validation = validateCoverFile(file)
  if (validation) throw new Error(validation)

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `obras/${userId}/${obraId}/capa.${ext}`

  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteCoverByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return
  const path = extractCoverStoragePath(url)
  if (!path) return
  await supabase.storage.from(COVERS_BUCKET).remove([path])
}
