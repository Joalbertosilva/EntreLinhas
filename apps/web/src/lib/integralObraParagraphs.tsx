const CAPITULO_LINHA =
  /^(?:Capítulo|CAPÍTULO|CAPITULO)\s+(?:[IVXLCDM]{1,8}|\d{1,3})(?:\s*[.:—–-]\s*[^\n]{0,80})?$/i
const SECAO_LINHA = /^(?:PREFÁCIO|Prefácio|POSFÁCIO|Posfácio|SUMÁRIO|Sumário)$/i
const TITULO_OBRA_LINHA =
  /^(?:A\s+)?REVO(?:LUÇÃO|LUÇAO)\s+DOS\s+BICHOS|GEORGE\s+ORWELL|A\s+Revolução\s+dos\s+Bichos$/i

export type ObraParagrafoBloco = { kind: 'capitulo' | 'secao' | 'titulo' | 'texto'; text: string }

export function splitObraEmParagrafosBlocos(texto: string): ObraParagrafoBloco[] {
  const trimmed = texto.trim()
  if (!trimmed) return []
  const parts = trimmed.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean)
  const linhas = parts.length > 1 ? parts : trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean)

  return linhas.map((line) => {
    const norm = line.replace(/\s+/g, ' ').trim()
    if (CAPITULO_LINHA.test(norm)) return { kind: 'capitulo' as const, text: norm }
    if (SECAO_LINHA.test(norm)) return { kind: 'secao' as const, text: norm }
    if (TITULO_OBRA_LINHA.test(norm)) return { kind: 'titulo' as const, text: norm }
    if (/^Na história\.?\s/i.test(norm)) return { kind: 'texto' as const, text: norm }
    return { kind: 'texto' as const, text: line }
  })
}

export function splitObraEmParagrafos(texto: string): string[] {
  return splitObraEmParagrafosBlocos(texto).map((b) => b.text)
}

export function isIntegralCapituloLinha(linha: string): boolean {
  return CAPITULO_LINHA.test(linha.trim())
}