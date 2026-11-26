/** Linha típica de sumário extraído de PDF (pontilhados + número de página). */
export function isPdfTableOfContentsLine(line: string): boolean {
  const t = line.trim().replace(/\s+/g, ' ')
  if (t.length < 4) return false

  const capituloHits = t.match(/\bCapítulo\s+/gi)?.length ?? 0
  if (capituloHits >= 2) return true

  if (/\bCapítulo\s+[IVXLCDM\d]+[.:]?\s*(?:\.\s*){2,}/i.test(t)) return true
  if (/\b(?:CHAPTER|CHAPITRE)\s+[IVXLCDM\d]+[.:]?\s*(?:\.\s*){2,}/i.test(t)) return true

  if (/\bCapítulo\b/i.test(t) && (/\.{2,}/.test(t) || /\s\.\.\s+\d+\s*$/.test(t))) return true
  if (/\b(?:SUMÁRIO|Sumário|ÍNDICE|Indice|Contents)\b/i.test(t) && t.length < 80) return true

  return false
}

export function normalizePortugueseChapterTitle(line: string): string {
  let t = line.trim().replace(/\s+/g, ' ')
  t = t.replace(/\s*\.{2,}.*$/, '')
  t = t.replace(/\s+\d{1,4}\s*$/, '')
  const m = t.match(/^((?:Capítulo|CAPÍTULO)\s+(?:[IVXLCDM]+|\d+)(?:\s*[.:—–-]\s*[^.]{0,80})?)/i)
  if (m) return m[1]!.replace(/\s+/g, ' ').trim()
  if (t.length <= 120) return t
  return t.slice(0, 80).trim()
}

export function stripPdfTocLines(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((line) => !isPdfTableOfContentsLine(line))
    .join('\n')
}