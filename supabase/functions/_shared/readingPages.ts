export type CapituloParsedLike = {
  ordem: number
  titulo: string
  texto_pt: string
  texto_origem: string | null
}

/** Tamanho alvo de cada folha no leitor (Anterior / Próxima), alinhado ao conforto de uma tela. */
export const INTEGRAL_FOLHA_MAX_CHARS = 2_800

/** Só fatia capítulos/páginas visivelmente longos (evita piloto JSON com trechos curtos). */
export const INTEGRAL_FOLHA_MIN_SPLIT = 3_000

const CONTINUACAO_SUFFIX_RE = /\s+—\s+(?:parte|folha)\s+\d+$/i

export function splitTextoEmFolhasLeitura(text: string, maxChars = INTEGRAL_FOLHA_MAX_CHARS): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  if (trimmed.length <= maxChars) return [trimmed]

  const parts: string[] = []
  const paragraphs = trimmed.split(/\n\s*\n/)
  let buf = ''

  const flush = () => {
    if (buf.trim()) {
      parts.push(buf.trim())
      buf = ''
    }
  }

  for (const p of paragraphs) {
    const block = p.trim()
    if (!block) continue

    if (block.length > maxChars) {
      flush()
      for (let i = 0; i < block.length; i += maxChars) {
        let slice = block.slice(i, i + maxChars)
        if (i + maxChars < block.length) {
          const lastSpace = slice.lastIndexOf(' ')
          if (lastSpace > maxChars * 0.55) slice = slice.slice(0, lastSpace).trim()
        }
        if (slice.length >= 12) parts.push(slice)
      }
      continue
    }

    const next = buf ? `${buf}\n\n${block}` : block
    if (next.length > maxChars && buf) {
      flush()
      buf = block
    } else if (next.length > maxChars) {
      parts.push(block)
    } else {
      buf = next
    }
  }
  flush()

  return parts.length > 0 ? parts : [trimmed]
}

function tituloBaseCapitulo(titulo: string): string {
  return titulo.replace(CONTINUACAO_SUFFIX_RE, '').trim() || titulo.trim()
}

function tituloFolha(base: string, partIndex: number, totalParts: number): string {
  if (totalParts <= 1) return base
  if (partIndex === 0) return base
  return `${tituloBaseCapitulo(base)} — parte ${partIndex + 1}`
}

/** Divide trechos longos em várias folhas gravadas no banco (mesmo ritmo do PDF por página). */
export function expandCapitulosParaFolhasLeitura<T extends CapituloParsedLike>(
  capitulos: T[],
  options?: { maxChars?: number; minSplit?: number },
): T[] {
  const maxChars = options?.maxChars ?? INTEGRAL_FOLHA_MAX_CHARS
  const minSplit = options?.minSplit ?? INTEGRAL_FOLHA_MIN_SPLIT
  if (capitulos.length === 0) return capitulos

  const out: T[] = []

  for (const cap of capitulos) {
    const texto = cap.texto_pt.trim()
    if (texto.length < minSplit) {
      out.push(cap)
      continue
    }

    const folhas = splitTextoEmFolhasLeitura(texto, maxChars)
    if (folhas.length <= 1) {
      out.push(cap)
      continue
    }

    for (let i = 0; i < folhas.length; i++) {
      out.push({
        ordem: 0,
        titulo: tituloFolha(cap.titulo, i, folhas.length),
        texto_pt: folhas[i]!,
        texto_origem: cap.texto_origem,
      })
    }
  }

  return out.map((c, idx) => ({ ...c, ordem: idx + 1 }))
}