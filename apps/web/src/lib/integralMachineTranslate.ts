import { supabase } from '@/lib/supabase'

const CHUNK_CHARS = 1_800

function splitForTranslation(text: string): string[] {
  const trimmed = text.trim()
  if (trimmed.length <= CHUNK_CHARS) return [trimmed]

  const parts: string[] = []
  const paragraphs = trimmed.split(/\n\s*\n/)
  let buf = ''

  for (const p of paragraphs) {
    const next = buf ? `${buf}\n\n${p}` : p
    if (next.length > CHUNK_CHARS && buf) {
      parts.push(buf)
      buf = p
    } else if (next.length > CHUNK_CHARS) {
      for (let i = 0; i < p.length; i += CHUNK_CHARS) {
        parts.push(p.slice(i, i + CHUNK_CHARS))
      }
      buf = ''
    } else {
      buf = next
    }
  }
  if (buf) parts.push(buf)
  return parts.filter((s) => s.length > 0)
}

export async function translateChunkGtx(text: string, sourceLang: string): Promise<string> {
  const sl = sourceLang === 'desconhecido' || sourceLang === 'origem' ? 'auto' : sourceLang
  const url = new URL('https://translate.googleapis.com/translate_a/single')
  url.searchParams.set('client', 'gtx')
  url.searchParams.set('sl', sl)
  url.searchParams.set('tl', 'pt')
  url.searchParams.set('dt', 't')
  url.searchParams.set('q', text)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Tradução indisponível (HTTP ${res.status})`)

  const json = (await res.json()) as unknown
  if (!Array.isArray(json) || !Array.isArray(json[0])) {
    throw new Error('Resposta de tradução inválida')
  }
  const segments = json[0] as Array<[string, ...unknown[]]>
  const merged = segments
    .map((row) => row[0])
    .filter(Boolean)
    .join('')
  if (!merged.trim()) throw new Error('Tradução vazia')
  return merged.trim()
}

export async function translateLongTextGtx(text: string, sourceLang: string): Promise<string> {
  const chunks = splitForTranslation(text)
  const parts: string[] = []
  for (const chunk of chunks) {
    parts.push(await translateChunkGtx(chunk, sourceLang))
    await new Promise((r) => setTimeout(r, 80))
  }
  return parts.join('\n\n')
}

export async function translateCapitulosIntegralNoCliente(
  conteudoId: string,
  sourceLang: string,
  onProgress?: (current: number, total: number) => void,
): Promise<number> {
  const { data: caps, error: listError } = await supabase
    .from('conteudo_capitulos_integral')
    .select('id, ordem, titulo, texto_pt, texto_origem')
    .eq('conteudo_id', conteudoId)
    .order('ordem', { ascending: true })

  if (listError) throw listError
  if (!caps?.length) throw new Error('Nenhum capítulo para traduzir')

  let done = 0
  for (const cap of caps) {
    onProgress?.(done + 1, caps.length)
    const original = cap.texto_pt
    const [tituloPt, textoPt] = await Promise.all([
      translateLongTextGtx(cap.titulo, sourceLang),
      translateLongTextGtx(original, sourceLang),
    ])

    const { error: upError } = await supabase
      .from('conteudo_capitulos_integral')
      .update({
        titulo: tituloPt,
        texto_pt: textoPt,
        texto_origem: original,
      })
      .eq('id', cap.id)

    if (upError) throw upError
    done++
  }

  const { error: metaError } = await supabase
    .from('conteudos')
    .update({
      integral_traducao_metodo: 'preimportado',
      integral_traducao_credito: 'EntreLinhas (tradução automática)',
    })
    .eq('id', conteudoId)

  if (metaError) throw metaError
  return caps.length
}