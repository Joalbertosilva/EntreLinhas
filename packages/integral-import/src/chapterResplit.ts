import { isChapterLikeTitle } from './chapterTitles'
import { normalizePortugueseChapterTitle } from './pdfToc'
import type { CapituloParsed } from './types'

/** Quando poucos blocos grandes ainda contêm títulos de capítulo no texto, redivide. */
export function expandCapitulosSeHeadingsEmbutidos(capitulos: CapituloParsed[]): CapituloParsed[] {
  const out: CapituloParsed[] = []

  for (const cap of capitulos) {
    const lines = cap.texto_pt.split(/\r?\n/)
    const markers: { line: number; titulo: string }[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trim()
      if (!line) continue
      if (isChapterLikeTitle(line)) {
        markers.push({ line: i, titulo: normalizePortugueseChapterTitle(line) })
      }
    }

    const precisaExpandir =
      markers.length >= 2 &&
      (capitulos.length <= 4 || cap.texto_pt.length > 12_000) &&
      markers.length > 1

    if (!precisaExpandir) {
      out.push(cap)
      continue
    }

    for (let m = 0; m < markers.length; m++) {
      const startLine = markers[m]!.line
      const endLine = m + 1 < markers.length ? markers[m + 1]!.line : lines.length
      const chunk = lines.slice(startLine, endLine).join('\n').trim()
      if (chunk.length < 40) continue
      out.push({
        ordem: 0,
        titulo: markers[m]!.titulo,
        texto_pt: chunk,
        texto_origem: cap.texto_origem,
      })
    }
  }

  return out.length > 0 ? out : capitulos
}