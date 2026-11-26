/** Marcador interno na extração PDF (ASCII — não quebra em encodings). */
export const INTEGRAL_PAGE_MARKER_RE = /\[\[INTEGRAL_PAG:(\d+)\]\]/g

const INTEGRAL_PAGE_MARKER_LEGACY = /⧗INTEGRAL_PAG:(\d+)⧗/g

export function integralPageMarker(pageNum: number): string {
  const n = String(pageNum).padStart(5, '0')
  return `\n\n[[INTEGRAL_PAG:${n}]]\n\n`
}

export function hasIntegralPageMarkers(text: string): boolean {
  return /\[\[INTEGRAL_PAG:\d+\]\]/.test(text) || /⧗INTEGRAL_PAG:\d+⧗/.test(text)
}

export function stripIntegralPageMarkers(text: string): string {
  return text
    .replace(INTEGRAL_PAGE_MARKER_RE, '')
    .replace(INTEGRAL_PAGE_MARKER_LEGACY, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Garante marcadores em linhas isoladas para o split. */
export function spacingIntegralPageMarkers(text: string): string {
  return text
    .replace(INTEGRAL_PAGE_MARKER_RE, (m) => `\n${m}\n`)
    .replace(INTEGRAL_PAGE_MARKER_LEGACY, (m) => `\n${m}\n`)
}

export type IntegralDivisaoModo = 'capitulos' | 'paginas' | 'partes' | 'texto_unico'

export function inferIntegralDivisaoModo(
  capitulos: { titulo: string }[],
): IntegralDivisaoModo {
  if (capitulos.length === 0) return 'texto_unico'
  if (
    capitulos.every((c) => {
      const t = c.titulo.trim()
      return (
        /^Página\s+\d+(?:\s+—\s+parte\s+\d+)?$/i.test(t) ||
        /^(?:Capítulo|CAPÍTULO)\s+/i.test(t)
      )
    })
  ) {
    return 'paginas'
  }
  if (capitulos.every((c) => /^Parte\s+\d+$/i.test(c.titulo.trim()))) return 'partes'
  if (capitulos.length === 1 && /^Texto integral$/i.test(capitulos[0]!.titulo.trim())) {
    return 'texto_unico'
  }
  return 'capitulos'
}