import type { ConteudoCapituloIntegral } from '@tcc-sistema/types'

/** Na importação, `texto_origem` costuma ser URL ou rótulo curto — não o texto pré-tradução. */
export function isIntegralFonteMetadata(origem: string): boolean {
  const s = origem.trim()
  if (!s) return true
  if (/^https?:\/\//i.test(s)) return true
  if (/^arquivo:/i.test(s)) return true
  if (/^arquivo enviado pelo professor$/i.test(s)) return true
  return false
}

const PT_MARKERS = /\b(capitulo|capítulo|não|também|porque|uma|você|está|são|como|mais|seu|sua)\b/i
const EN_MARKERS = /\b(the|and|chapter|was|were|with|from|this|that)\b/i
const FR_MARKERS = /\b(chapitre|premier|être|avec|dans|pour|cette|était)\b/i

/** Idioma de origem para tradutor (MyMemory etc.) a partir do texto + dica do import. */
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

export function parecePortugues(texto: string): boolean {
  return inferirIdiomaOrigemTrecho(texto, 'auto') === 'pt'
}

export function obraIntegralJaEmPortugues(capitulos: Array<{ texto_pt: string }>): boolean {
  if (capitulos.length === 0) return false
  const amostra = capitulos.map((c) => c.texto_pt).join('\n').slice(0, 12_000)
  return inferirIdiomaOrigemTrecho(amostra, 'auto') === 'pt'
}

export function capituloPareceJaTraduzido(cap: ConteudoCapituloIntegral): boolean {
  const orig = cap.texto_origem?.trim()
  const pt = cap.texto_pt?.trim()
  if (!orig || !pt || orig === pt) return false
  if (isIntegralFonteMetadata(orig)) return false
  if (orig.length < 40 || pt.length < 40) return false
  const ratio = orig.length / Math.max(pt.length, 1)
  if (ratio < 0.45 || ratio > 2.2) return false
  if (!parecePortugues(pt)) return false
  if (EN_MARKERS.test(orig) || FR_MARKERS.test(orig)) return true
  if (parecePortugues(orig)) return false
  return false
}

export function traducaoPareceValida(
  original: string,
  traduzido: string,
  sourceLang: string,
): boolean {
  const a = original.trim()
  const b = traduzido.trim()
  if (!b) return false
  if (a === b) return false
  if (sourceLang === 'pt') return true
  const origemInferida = inferirIdiomaOrigemTrecho(a, sourceLang)
  if (origemInferida !== 'pt' && parecePortugues(b)) return true
  if (parecePortugues(b) && (sourceLang !== 'pt' || !parecePortugues(a))) return true
  if (EN_MARKERS.test(a) && (PT_MARKERS.test(b) || /[ãõç]/i.test(b))) return true
  if (FR_MARKERS.test(a) && (PT_MARKERS.test(b) || /[ãõç]/i.test(b))) return true
  return b.length >= 20 && a.length >= 20 && b !== a
}

/** Evita reutilizar cache com texto ainda no idioma original (ex.: falha antiga gravada no navegador). */
export function traducaoPaginaLeitorCacheValida(
  originalCorpo: string,
  entrada: { titulo: string; corpo: string },
  idiomaOrigem: string,
): boolean {
  const o = originalCorpo.trim()
  const c = entrada.corpo.trim()
  if (!c) return false
  if (o === c) return false
  if (idiomaOrigem === 'pt') return true
  return traducaoPareceValida(o, c, idiomaOrigem)
}