import { obraExportCapaFromBytes, type ObraExportCapaImagem } from '@tcc-sistema/obra-export'
import * as FileSystem from 'expo-file-system/legacy'

function mimeFromUri(uri: string): string | undefined {
  const lower = uri.toLowerCase()
  if (lower.includes('.png')) return 'image/png'
  if (lower.includes('.webp')) return 'image/webp'
  if (lower.includes('.gif')) return 'image/gif'
  return 'image/jpeg'
}

async function bytesFromLocalOrRemoteUri(uri: string): Promise<Uint8Array | null> {
  if (uri.startsWith('file://') || uri.startsWith('content://')) {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  }

  const dir = FileSystem.cacheDirectory
  if (!dir) return null
  const local = `${dir}obra-export-capa-${Date.now()}.img`
  const downloaded = await FileSystem.downloadAsync(uri, local)
  const base64 = await FileSystem.readAsStringAsync(downloaded.uri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

export async function resolveCapaImagemParaExport(imageUri: string | null | undefined): Promise<ObraExportCapaImagem | null> {
  if (!imageUri?.trim()) return null
  try {
    const bytes = await bytesFromLocalOrRemoteUri(imageUri.trim())
    if (!bytes || bytes.length < 32) return null
    return obraExportCapaFromBytes(bytes, mimeFromUri(imageUri))
  } catch {
    return null
  }
}