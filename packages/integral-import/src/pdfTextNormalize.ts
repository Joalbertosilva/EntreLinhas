/** Remove www. colado a título de obra (cabeçalho MEC/NEAD), não URL real. */
export function stripWwwObraHeaders(text: string): string {
  let t = text
  t = t.replace(/\bwww\.nead[^\s]*/gi, '')
  t = t.replace(/\bwww\.dominiopublico[^\s]*/gi, '')
  t = t.replace(/\bwww\.[a-z0-9-]+\.(?:br|com|gov|org|net|edu)[^\s]*/gi, '')
  t = t.replace(/\bwww\.(?=[A-ZÀ-ÚÍÓÊÂÔ])/g, '')
  return t
}

/** “C A P Í T U L O I I” → título legível em uma linha (só linhas com letras espaçadas de propósito). */
export function normalizeSpacedPdfBannerLines(text: string): string {
  return text
    .split('\n')
    .map((raw) => {
      const line = raw.trim()
      if (!/^(?:[A-ZÁÀÂÃÉÍÓÔÕÚÇ]\s+){4,}/.test(line)) return raw
      const collapsed = line.replace(/\s+/g, '')
      if (/^CAP[ÍI]TULO/i.test(collapsed)) {
        const rest = collapsed.replace(/^CAP[ÍI]TULO/i, '').trim()
        return `Capítulo ${rest}`.trim()
      }
      return collapsed.replace(/([a-záàâãéêíóôõúç])([A-ZÁÀÂÃÉÍÓÔÕÚÇ])/g, '$1 $2')
    })
    .join('\n')
}

/** Quebra de linha com hífen: “fe- char” → “fechar”. */
export function fixPdfLineBreakHyphens(text: string): string {
  let t = text
  t = t.replace(/(\p{L})-\s*\n\s*(\p{L})/gu, '$1$2')
  t = t.replace(/(\p{L})-\s+(\p{Ll})/gu, '$1$2')
  return t
}

/** Cola espaço indevido antes de pontuação. */
export function fixPdfPunctuationGlue(text: string): string {
  let t = text
  t = t.replace(/\s+([,.;:!?…])/g, '$1')
  t = t.replace(/([.!?…])([^\s\d»"'\])])/g, '$1 $2')
  return t
}

const DIALOGUE_START_RE = /^[\u2014\u2013\u00ad\-]\s/
const CHAPTER_HEADING_RE = /^(?:CAP[ÍI]TULO|Capítulo)\s+/i
const PAGE_LABEL_RE = /^Página\s+\d+\s*$/i
const SPACED_BANNER_RE = /^(?:[A-ZÁÀÂÃÉÍÓÔÕÚÇ]\s+){4,}/

function nextNonemptyLine(lines: string[], fromIndex: number): string | null {
  for (let j = fromIndex + 1; j < lines.length; j++) {
    const t = lines[j]!.trim()
    if (t.length > 0) return t
  }
  return null
}

function isLikelySectionTitle(line: string, nextLine: string | null): boolean {
  const t = line.trim()
  if (t.length > 72 || /[.!?…:]$/.test(t) || DIALOGUE_START_RE.test(t)) return false
  if (PAGE_LABEL_RE.test(t) || CHAPTER_HEADING_RE.test(t)) return true
  if (!nextLine || !/^[a-záàâãéêíóôõúç]/.test(nextLine)) return false
  const words = t.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 14) return false
  return words.every(
    (w) => /^[A-ZÁÀÂÃÉÍÓÔÕÚÇ"'(0-9]/.test(w) || /^(do|da|de|dos|das|e|o|a|os|as)$/i.test(w),
  )
}

function shouldBreakBeforeAccumulated(accumulated: string, line: string): boolean {
  const prev = accumulated.trim()
  const next = line.trim()
  if (!prev) return false
  if (PAGE_LABEL_RE.test(next) || CHAPTER_HEADING_RE.test(next) || SPACED_BANNER_RE.test(next)) return true
  if (DIALOGUE_START_RE.test(next)) {
    if (/[.!?…"»)]\s*$/.test(prev)) return true
    if (prev.endsWith(':')) return true
  }
  return false
}

/**
 * Junta quebras de linha do layout do PDF em parágrafos corridos (leitura),
 * preservando títulos, “Página N”, capítulos, travessões e linhas em branco.
 */
export function reflowPdfParagraphLines(text: string): string {
  const rawLines = text.replace(/\r/g, '').split('\n')
  const paragraphs: string[] = []
  let current = ''

  const flush = () => {
    const t = current.replace(/[ \t]{2,}/g, ' ').trim()
    if (t) paragraphs.push(t)
    current = ''
  }

  let blankRun = 0

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i]!.trimEnd().trim()
    if (!line) {
      blankRun += 1
      // Uma linha vazia no PDF costuma ser artefato de coluna — só quebra parágrafo com duas seguidas.
      if (blankRun >= 2) flush()
      continue
    }
    blankRun = 0

    const next = nextNonemptyLine(rawLines, i)

    if (PAGE_LABEL_RE.test(line) || CHAPTER_HEADING_RE.test(line) || SPACED_BANNER_RE.test(line)) {
      flush()
      paragraphs.push(line)
      continue
    }

    if (isLikelySectionTitle(line, next)) {
      flush()
      paragraphs.push(line)
      continue
    }

    if (current && shouldBreakBeforeAccumulated(current, line)) {
      flush()
      current = line
      continue
    }

    if (!current) {
      current = line
    } else {
      const joiner = /[-\u2014\u2013]$/.test(current) ? '' : ' '
      current = `${current}${joiner}${line}`
    }
  }

  flush()
  return paragraphs.join('\n\n')
}

/**
 * Normalização mínima pós-extração: não reescreve palavras do livro.
 * O texto deve vir certo na montagem dos fragmentos do PDF (integralPdfText.ts).
 */
export function normalizeIntegralReadingText(text: string): string {
  let t = text
  t = stripWwwObraHeaders(t)
  t = fixPdfLineBreakHyphens(t)
  t = reflowPdfParagraphLines(t)
  t = normalizeSpacedPdfBannerLines(t)
  t = fixPdfPunctuationGlue(t)
  t = t.replace(/[ \t]{2,}/g, ' ')
  t = t.replace(/\n{3,}/g, '\n\n')
  return t.trim()
}

export function normalizePdfExtractedPageText(text: string): string {
  return normalizeIntegralReadingText(text)
}

/** Mantidos só para testes legados — não alteram o texto. */
export function fixPdfMissingWordSpaces(text: string): string {
  return text
}

export function fixPdfGlueArticlesAndPronouns(text: string): string {
  return text
}

export function fixPdfBrokenWords(text: string): string {
  return text
}

export function fixPdfSpuriousSpacesInWords(text: string): string {
  return text
}

export function fixGluedPortugueseClitics(text: string): string {
  return text
}
