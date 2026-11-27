export interface ObraExportCapaImagem {
  base64: string
  mimeType: string
  width?: number
  height?: number
}

export function capaImagemDataUrl(capa: ObraExportCapaImagem): string {
  return `data:${capa.mimeType};base64,${capa.base64}`
}

/** Encaixa a capa na área útil do PDF (pontos), preservando proporção. */
export function capaDimensoesPdf(
  capa: ObraExportCapaImagem,
  maxWidth = 415,
  maxHeight = 580,
): { width: number; height: number } {
  const w = capa.width && capa.width > 0 ? capa.width : 600
  const h = capa.height && capa.height > 0 ? capa.height : 800
  const scale = Math.min(maxWidth / w, maxHeight / h, 1)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

/** Largura em DXA (docx) para imagem de capa centralizada. */
export function capaDimensoesDocx(capa: ObraExportCapaImagem, maxWidthPx = 340): { width: number; height: number } {
  const w = capa.width && capa.width > 0 ? capa.width : 600
  const h = capa.height && capa.height > 0 ? capa.height : 800
  const width = Math.min(maxWidthPx, w)
  const height = Math.round((h / w) * width)
  return { width, height }
}