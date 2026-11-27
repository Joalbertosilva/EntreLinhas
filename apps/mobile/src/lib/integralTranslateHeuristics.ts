const PT_MARKERS = /\b(capitulo|capítulo|não|também|porque|uma|você|está|são|como|mais|seu|sua)\b/i
const EN_MARKERS = /\b(the|and|chapter|was|were|with|from|this|that)\b/i
const FR_MARKERS = /\b(chapitre|premier|être|avec|dans|pour|cette|était)\b/i

export function inferirIdiomaOrigemTrecho(texto: string, hint = 'auto'): string {
  if (hint && hint !== 'auto' && hint !== 'desconhecido' && hint !== 'origem' && hint !== 'pt') {
    return hint
  }
  const amostra = texto.slice(0, 5_000)
  if (FR_MARKERS.test(amostra) || /\b(le|la|les|des|une|dans|pour|avec)\b/i.test(amostra)) return 'fr'
  if (EN_MARKERS.test(amostra)) return 'en'
  if (PT_MARKERS.test(amostra) && !EN_MARKERS.test(amostra) && !FR_MARKERS.test(amostra)) return 'pt'
  if (/[ãõ]/i.test(amostra) && !FR_MARKERS.test(amostra)) return 'pt'
  return hint && hint !== 'desconhecido' && hint !== 'origem' ? hint : 'auto'
}

export function obraIntegralJaEmPortugues(capitulos: Array<{ texto_pt: string }>): boolean {
  if (capitulos.length === 0) return false
  const amostra = capitulos.map((c) => c.texto_pt).join('\n').slice(0, 12_000)
  return inferirIdiomaOrigemTrecho(amostra, 'auto') === 'pt'
}