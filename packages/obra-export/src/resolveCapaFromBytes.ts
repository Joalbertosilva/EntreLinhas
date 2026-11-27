import type { ObraExportCapaImagem } from './capaImagem'
import { uint8ArrayToBase64 } from './base64'

function sniffMime(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif'
  if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp'
  return 'image/jpeg'
}

function readPngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null
  const w = (bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!
  const h = (bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!
  return { width: w, height: h }
}

function readJpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  let i = 2
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i++
      continue
    }
    const marker = bytes[i + 1]
    if (marker === 0xc0 || marker === 0xc2) {
      const h = (bytes[i + 5]! << 8) | bytes[i + 6]!
      const w = (bytes[i + 7]! << 8) | bytes[i + 8]!
      return { width: w, height: h }
    }
    const len = (bytes[i + 2]! << 8) | bytes[i + 3]!
    i += 2 + len
  }
  return null
}

function imageDimensions(bytes: Uint8Array, mime: string): { width?: number; height?: number } {
  if (mime === 'image/png') {
    const s = readPngSize(bytes)
    return s ?? {}
  }
  if (mime === 'image/jpeg') {
    const s = readJpegSize(bytes)
    return s ?? {}
  }
  return {}
}

export function obraExportCapaFromBytes(bytes: Uint8Array, mimeHint?: string): ObraExportCapaImagem {
  const mimeType = mimeHint?.split(';')[0]?.trim() || sniffMime(bytes)
  const dims = imageDimensions(bytes, mimeType)
  return {
    base64: uint8ArrayToBase64(bytes),
    mimeType,
    ...dims,
  }
}