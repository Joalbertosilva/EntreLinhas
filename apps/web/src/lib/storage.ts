import { supabase } from '@/lib/supabase'

const COVERS_BUCKET = 'covers'
const MAX_BYTES = 5 * 1024 * 1024

export function validateCoverFile(file: File): string | null {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp']
  const typeOk = !type || allowedTypes.includes(type)
  const extOk = allowedExt.some((ext) => name.endsWith(ext))
  if (!typeOk && !extOk) {
    return 'Use JPG, PNG ou WebP'
  }
  if (file.size > MAX_BYTES) {
    return 'A imagem deve ter no máximo 5 MB'
  }
  return null
}

/** URL pública com parâmetro para evitar cache do navegador após novo upload */
export function withCacheBust(url: string, version?: number | string): string {
  const v = version ?? Date.now()
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${v}`
}

/** Compara caminhos no bucket; ignora query string (`?v=`). */
export function sameCoverStorageObject(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const pathA = a ? extractCoverStoragePath(a) : null
  const pathB = b ? extractCoverStoragePath(b) : null
  if (!pathA || !pathB) return false
  return pathA === pathB
}

export function coverFileExtension(file: File): 'png' | 'webp' | 'jpg' {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  if (type === 'image/png' || name.endsWith('.png')) return 'png'
  if (type === 'image/webp' || name.endsWith('.webp')) return 'webp'
  return 'jpg'
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

  const ext = coverFileExtension(file)
  const path = `${contentId}/capa.${ext}`

  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    cacheControl: '3600',
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return withCacheBust(data.publicUrl)
}

async function uploadObraCoverFile(
  file: File,
  userId: string,
  obraId: string,
  fileBaseName: 'capa' | 'capa-foto',
): Promise<string> {
  const validation = validateCoverFile(file)
  if (validation) throw new Error(validation)

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `obras/${userId}/${obraId}/${fileBaseName}.${ext}`

  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
    cacheControl: '3600',
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return withCacheBust(data.publicUrl)
}

export async function uploadObraCover(file: File, userId: string, obraId: string): Promise<string> {
  return uploadObraCoverFile(file, userId, obraId, 'capa')
}

export async function uploadObraCapaFoto(file: File, userId: string, obraId: string): Promise<string> {
  return uploadObraCoverFile(file, userId, obraId, 'capa-foto')
}

export async function deleteCoverByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return
  const path = extractCoverStoragePath(url)
  if (!path) return
  await supabase.storage.from(COVERS_BUCKET).remove([path])
}

export async function uploadProfileAvatar(file: File, userId: string): Promise<string> {
  const validation = validateCoverFile(file)
  if (validation) throw new Error(validation)

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `avatars/${userId}/avatar.${ext}`

  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
    cacheControl: '3600',
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return withCacheBust(data.publicUrl)
}

export async function persistMyAvatarUrl(url: string | null): Promise<void> {
  const { error } = await supabase.rpc('update_my_avatar_url', { p_avatar_url: url })
  if (error) throw new Error(error.message)
}
