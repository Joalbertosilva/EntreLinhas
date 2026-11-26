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

/**
 * Normalização mínima pós-extração: não reescreve palavras do livro.
 * O texto deve vir certo na montagem dos fragmentos do PDF (integralPdfText.ts).
 */
export function normalizeIntegralReadingText(text: string): string {
  let t = text
  t = stripWwwObraHeaders(t)
  t = fixPdfLineBreakHyphens(t)
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

export function reflowPdfParagraphLines(text: string): string {
  return text
}