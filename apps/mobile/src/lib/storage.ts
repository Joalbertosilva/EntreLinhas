import { Buffer } from 'buffer'
import { supabase } from '@/lib/supabase'

const COVERS_BUCKET = 'covers'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const

export function validateCoverUri(fileSize: number | undefined, mimeType: string | undefined): string | null {
  const type = (mimeType ?? '').toLowerCase()
  if (type && !ALLOWED_MIMES.includes(type as (typeof ALLOWED_MIMES)[number])) {
    return 'Use JPG, PNG ou WebP'
  }
  if (fileSize != null && fileSize > MAX_BYTES) return 'A imagem deve ter no máximo 5 MB'
  return null
}

function extFromMime(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

/** ImagePicker no Android costuma devolver mime errado; inferimos pela extensão do arquivo. */
export function resolveImageMime(uri: string, reported?: string | null): string {
  const normalized = (reported ?? '').toLowerCase()
  if (normalized && ALLOWED_MIMES.includes(normalized as (typeof ALLOWED_MIMES)[number])) {
    return normalized === 'image/jpg' ? 'image/jpeg' : normalized
  }

  const path = uri.split('?')[0]?.toLowerCase() ?? ''
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.includes('.png')) return 'image/png'
  return 'image/jpeg'
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const raw = base64.replace(/^data:image\/\w+;base64,/, '')
  const bytes = Buffer.from(raw, 'base64')
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  if (uri.startsWith('file://') || uri.startsWith('content://')) {
    const FileSystem = await import('expo-file-system/legacy')
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return base64ToArrayBuffer(base64)
  }

  const response = await fetch(uri)
  if (!response.ok) {
    throw new Error(`Não foi possível ler a imagem (${response.status})`)
  }
  return response.arrayBuffer()
}

async function uploadCoverBytes(
  arrayBuffer: ArrayBuffer,
  userId: string,
  obraId: string,
  contentType: string,
  fileBaseName: 'capa' | 'capa-foto' = 'capa',
): Promise<string> {
  if (arrayBuffer.byteLength > MAX_BYTES) {
    throw new Error('A imagem deve ter no máximo 5 MB')
  }

  const ext = extFromMime(contentType)
  const path = `obras/${userId}/${obraId}/${fileBaseName}.${ext}`

  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, arrayBuffer, {
    upsert: true,
    contentType,
    cacheControl: '3600',
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}

/** Upload a partir de base64 (capa gerada pelo view-shot). */
export async function uploadObraCoverFromBase64(
  base64: string,
  userId: string,
  obraId: string,
): Promise<string> {
  const arrayBuffer = base64ToArrayBuffer(base64)
  return uploadCoverBytes(arrayBuffer, userId, obraId, 'image/jpeg')
}

export async function uploadObraCoverFromUri(
  uri: string,
  userId: string,
  obraId: string,
  mimeType = 'image/jpeg',
  fileSize?: number,
): Promise<string> {
  const contentType = resolveImageMime(uri, mimeType)
  const validation = validateCoverUri(fileSize, contentType)
  if (validation) throw new Error(validation)

  const arrayBuffer = await readUriAsArrayBuffer(uri)
  return uploadCoverBytes(arrayBuffer, userId, obraId, contentType)
}

/** Foto original (para regerar capa ao mudar o gênero). */
export async function uploadObraCapaFotoFromUri(
  uri: string,
  userId: string,
  obraId: string,
  mimeType = 'image/jpeg',
  fileSize?: number,
): Promise<string> {
  const contentType = resolveImageMime(uri, mimeType)
  const validation = validateCoverUri(fileSize, contentType)
  if (validation) throw new Error(validation)

  const arrayBuffer = await readUriAsArrayBuffer(uri)
  return uploadCoverBytes(arrayBuffer, userId, obraId, contentType, 'capa-foto')
}

export function withCacheBust(url: string, version?: number | string): string {
  const v = version ?? Date.now()
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${v}`
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

export async function deleteCoverByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return
  const path = extractCoverStoragePath(url)
  if (!path) return
  const { error } = await supabase.storage.from(COVERS_BUCKET).remove([path])
  if (error) throw new Error(error.message)
}

async function uploadAvatarBytes(
  arrayBuffer: ArrayBuffer,
  userId: string,
  contentType: string,
): Promise<string> {
  if (arrayBuffer.byteLength > MAX_BYTES) {
    throw new Error('A imagem deve ter no máximo 5 MB')
  }

  const ext = extFromMime(contentType)
  const path = `avatars/${userId}/avatar.${ext}`

  const { error } = await supabase.storage.from(COVERS_BUCKET).upload(path, arrayBuffer, {
    upsert: true,
    contentType,
    cacheControl: '3600',
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
  return withCacheBust(data.publicUrl)
}

export async function uploadProfileAvatarFromUri(
  uri: string,
  userId: string,
  mimeType = 'image/jpeg',
  fileSize?: number,
): Promise<string> {
  const contentType = resolveImageMime(uri, mimeType)
  const validation = validateCoverUri(fileSize, contentType)
  if (validation) throw new Error(validation)

  const arrayBuffer = await readUriAsArrayBuffer(uri)
  return uploadAvatarBytes(arrayBuffer, userId, contentType)
}

export async function persistMyAvatarUrl(url: string | null): Promise<void> {
  const { error } = await supabase.rpc('update_my_avatar_url', { p_avatar_url: url })
  if (error) throw new Error(error.message)
}
