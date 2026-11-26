import { stripNeadFromChunk } from './cleanPdfText'
import { stripIntegralPageMarkers } from './pageMarkers'
import { normalizePdfExtractedPageText } from './pdfTextNormalize'

const PAGE_MARKER_CAPTURE = /\[\[INTEGRAL_PAG:(\d+)\]\]|⧗INTEGRAL_PAG:(\d+)⧗/g

/** Junta o PDF página a página, já com limpeza tipográfica. */
export function textoUnificadoFromPdfMarcadores(body: string): string {
  const matches = [...body.matchAll(PAGE_MARKER_CAPTURE)]
  if (matches.length === 0) {
    return normalizePdfExtractedPageText(stripIntegralPageMarkers(body))
  }

  const partes: string[] = []
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!
    const start = (match.index ?? 0) + match[0].length
    const end = i + 1 < matches.length ? (matches[i + 1]!.index ?? body.length) : body.length
    const chunk = body.slice(start, end).trim()
    if (!chunk) continue
    partes.push(normalizePdfExtractedPageText(stripNeadFromChunk(chunk)))
  }
  return partes.join('\n\n').trim()
}

/** Pula licença, sumário e prefácio — início na narrativa (Capítulo I + texto). */
export function trimIntegralNarrativaInicio(text: string): string {
  const narrativa = text.search(
    /\bCapítulo\s+I\b[\s\S]{0,600}\b(?:Sr\.?\s*Jones|da Granja do Solar|galinheir)/i,
  )
  if (narrativa >= 0) return text.slice(narrativa).trim()

  const capI = text.search(/\bCapítulo\s+I\b/i)
  if (capI >= 0 && capI < 80_000) return text.slice(capI).trim()

  return text.trim()
}