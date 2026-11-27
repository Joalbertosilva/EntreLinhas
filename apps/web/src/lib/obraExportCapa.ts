import { obraExportCapaFromBytes, type ObraExportCapaImagem } from '@tcc-sistema/obra-export'
import { obraCapaImageSrc } from '@/lib/obraCoverDisplay'

export async function resolveCapaImagemParaExport(input: {
  capaPreview: string | null
  capaUrl: string | null
  obraUpdatedAt?: string | null
}): Promise<ObraExportCapaImagem | null> {
  const src =
    input.capaPreview ?? obraCapaImageSrc(input.capaUrl, input.obraUpdatedAt ?? undefined)
  try {
    const res = await fetch(src)
    if (!res.ok) return null
    const buf = new Uint8Array(await res.arrayBuffer())
    if (buf.length < 32) return null
    return obraExportCapaFromBytes(buf, res.headers.get('content-type') ?? undefined)
  } catch {
    return null
  }
}