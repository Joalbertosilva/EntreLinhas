const NEAD_PAGE_MARK = /www\.nead\.unama\.br\s*\d+/gi

/** Remove cabeçalhos/rodapés típicos de PDFs do Domínio Público / NEAD e destrava capítulos colados. */
export function cleanDominioPublicoPdfText(raw: string): string {
  let text = raw.replace(/\r/g, '').trim()

  const firstCap = text.search(
    /\bCAP[ÍI]TULO\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]{1,7})\b/i,
  )
  if (firstCap > 0) {
    text = text.slice(firstCap)
  }

  text = text.replace(
    /Universidade da Amazônia[\s\S]*?(?=CAP[ÍI]TULO\s+)/i,
    '',
  )
  text = text.replace(/NEAD\s*[–-]\s*N[ÚU]CLEO DE EDUCAÇÃO A DIST[ÂA]NCIA[\s\S]*?(?=CAP[ÍI]TULO\s+)/gi, '')
  text = text.replace(/Dom Casmurro de Machado de Assis\s*/gi, '')

  text = text.replace(NEAD_PAGE_MARK, '\n')
  text = text.replace(/nead\.unama\.br\s*\d*/gi, '\n')
  text = text.replace(/www\.dominiopublico[^\s]*\s*\d*/gi, '\n')
  text = text.replace(/dominiopublico\.mec\.gov\.br\s*\d*/gi, '\n')
  text = text.replace(/\buvb@unama\.br\b/gi, '')
  text = text.replace(/Av\. Alcindo Cacela[\s\S]*?Bel[eé]m\s*[–-]\s*Par[aá]/gi, '')

  text = text.replace(/([.!?»"…])\s+(CAP[ÍI]TULO\s+)/gi, '$1\n\n$2')
  text = text.replace(
    /\s+(CAP[ÍI]TULO\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]{1,7})\s+)/gi,
    '\n\n$1',
  )
  text = text.replace(
    /(CAP[ÍI]TULO\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]{1,7})(?:\s+DO\s+(?:T[ÍI]TULO|LIVRO|AUTOR|PR[ÓO]LOGO))?)\s+(?=[A-ZÀ-ÚÍÓÊÂÔ][a-zà-úíóêâôãç])/g,
    '$1\n\n',
  )

  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^www\.nead\.unama\.br/i.test(line))
    .filter((line) => !/^Universidade da Amaz/i.test(line))
    .filter((line) => !/^NEAD\s*[–-]/i.test(line))
    .join('\n')

  text = text.replace(/[ \t]{2,}/g, ' ')
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

export function countMecCapituloHeadings(text: string): number {
  const matches = text.match(/\bCAP[ÍI]TULO\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]{1,7})\b/gi)
  return matches?.length ?? 0
}

export function isDominioPublicoPdfLikeText(text: string): boolean {
  return (
    /\bnead\.unama\.br\b/i.test(text) ||
    /\bdominiopublico\.mec\b/i.test(text) ||
    countMecCapituloHeadings(text) >= 2
  )
}

export function stripNeadFromChunk(chunk: string): string {
  return chunk
    .replace(NEAD_PAGE_MARK, '')
    .replace(/nead\.unama\.br\s*\d*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function trimMecPdfPreamble(part: string): string {
  const idx = part.search(
    /\bCAP[ÍI]TULO\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]{1,7})\b/i,
  )
  const trimmed = idx > 0 ? part.slice(idx).trim() : part.trim()
  return stripNeadFromChunk(trimmed)
}

const MEC_CAPITULO_TITLE =
  /^CAP[ÍI]TULO\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]{1,7})(?:\s+DO\s+(?:T[ÍI]TULO|LIVRO|AUTOR|PR[ÓO]LOGO|PRIMEIRA\s+PARTE|SEGUNDA\s+PARTE))?(?:\s*\/\s*[^\n.]{1,40})?/i

export function tituloFromMecCapituloPart(part: string): string {
  const head = part.slice(0, 120).trim()
  const m = head.match(MEC_CAPITULO_TITLE)
  if (m) return m[0].replace(/\s+/g, ' ').trim()
  const line = part.split(/\r?\n/).find((l) => l.trim().length > 0)?.trim()
  if (line) {
    const lm = line.match(MEC_CAPITULO_TITLE)
    if (lm) return lm[0].replace(/\s+/g, ' ').trim()
    if (line.length <= 120) return line
  }
  return 'Capítulo'
}