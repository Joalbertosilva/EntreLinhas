import translate from 'google-translate-api-x'
import { supabase } from '@/lib/supabase'
import {
  capituloPareceJaTraduzido,
  traducaoPareceValida,
} from '@/lib/integralTranslateHeuristics'
import {
  DETALHE_TRADUTOR_INDISPONIVEL,
  MSG_TRADUTOR_INDISPONIVEL,
} from '@/lib/integralTranslatePreflight'

export class IntegralTraducaoIndisponivelError extends Error {
  detalhe: string

  constructor() {
    super(MSG_TRADUTOR_INDISPONIVEL)
    this.name = 'IntegralTraducaoIndisponivelError'
    this.detalhe = DETALHE_TRADUTOR_INDISPONIVEL
  }
}
import type { ConteudoCapituloIntegral } from '@tcc-sistema/types'

const CHUNK_CHARS = 3_200
const CHUNK_PAUSE_MS = 220
const CHUNK_PAUSE_SLOW_MS = 1_800
const TRANSLATE_ATTEMPTS = 4
const TRANSLATE_ATTEMPTS_SLOW = 8

let slowModeAtivo = false
const MYMEMORY_MAX = 480

export type IntegralTranslateProgressFn = (
  capituloAtual: number,
  capituloTotal: number,
  detalhe?: string,
) => void

function mapLang(source: string): string {
  if (source === 'desconhecido' || source === 'origem' || source === 'auto') return 'auto'
  if (source === 'pt') return 'pt'
  return source
}

function cleanText(text: string): string {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/dataLayer[\s\S]{0,200}?\);/g, '')
    .replace(/\u0000/g, '')
    .replace(/\n{4,}/g, '\n\n')
    .trim()
}

function splitChunks(text: string): string[] {
  const trimmed = cleanText(text)
  if (!trimmed) return []
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
  return parts.filter((s) => s.trim().length > 0)
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}


async function translateViaDevProxy(text: string, sourceLang: string): Promise<string | null> {
  const q = cleanText(text)
  if (!q) return ''
  const body = new URLSearchParams({ sl: mapLang(sourceLang), tl: 'pt', q })
  try {
    const res = await fetch('/api/integral-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      sentences?: Array<{ trans?: string }>
      error?: string
    }
    if (json.error) return null
    const out = (json.sentences ?? [])
      .map((s) => s.trans ?? '')
      .join('')
      .trim()
    return out.length > 0 && out !== q ? out : null
  } catch {
    return null
  }
}

async function translateViaLibreTranslateVite(text: string, sourceLang: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_LIBRETRANSLATE_API_KEY?.trim()
  if (!apiKey) return null
  const base = (import.meta.env.VITE_LIBRETRANSLATE_URL ?? 'https://libretranslate.com').replace(/\/$/, '')

  try {
    const res = await fetch(`${base}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: cleanText(text),
        source: mapLang(sourceLang),
        target: 'pt',
        format: 'text',
        api_key: apiKey,
      }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { translatedText?: string }
    const out = json.translatedText?.trim() ?? ''
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

async function translateViaMyMemory(text: string, sourceLang: string): Promise<string | null> {
  const q = cleanText(text)
  const slice = q.length > MYMEMORY_MAX ? q.slice(0, MYMEMORY_MAX) : q
  const sl = mapLang(sourceLang) === 'auto' ? 'en' : mapLang(sourceLang)
  const email = import.meta.env.VITE_MYMEMORY_EMAIL?.trim()

  const params = new URLSearchParams({ q: slice, langpair: `${sl}|pt` })
  if (email) params.set('de', email)

  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?${params}`)
    if (!res.ok) return null
    const json = (await res.json()) as {
      responseData?: { translatedText?: string }
      quotaFinished?: boolean
    }
    const out = json.responseData?.translatedText?.trim() ?? ''
    if (!out || out.includes('MYMEMORY WARNING') || json.quotaFinished) return null
    return out
  } catch {
    return null
  }
}

async function translateChunkViaServidor(text: string, sourceLang: string): Promise<string | null> {
  const q = cleanText(text)
  if (!q) return ''

  try {
    const { data, error } = await supabase.functions.invoke('translate-integral-texto', {
      body: { texto: q.slice(0, 8_000), idioma_origem: sourceLang },
    })
    if (error) return null
    if (data?.texto_pt && typeof data.texto_pt === 'string') {
      const out = data.texto_pt.trim()
      if (out) return out
    }
    return null
  } catch {
    return null
  }
}

async function translateChunkViaNavegadorLib(text: string, sourceLang: string): Promise<string | null> {
  const q = cleanText(text)
  if (!q) return ''
  const from = mapLang(sourceLang)

  try {
    const res = await translate(q, {
      from,
      to: 'pt',
      fallbackBatch: true,
      forceBatch: q.length > 3_500,
    })
    if (res.text.trim()) return res.text.trim()
  } catch {
    /* rede / limite */
  }
  return null
}

async function translateChunk(text: string, sourceLang: string): Promise<string> {
  const q = cleanText(text)
  if (!q) return ''

  const maxAttempts = slowModeAtivo ? TRANSLATE_ATTEMPTS_SLOW : TRANSLATE_ATTEMPTS

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const proxy = await translateViaDevProxy(q, sourceLang)
    if (proxy) return proxy

    const lib = await translateChunkViaNavegadorLib(q, sourceLang)
    if (lib) return lib

    const servidor = await translateChunkViaServidor(q, sourceLang)
    if (servidor) return servidor

    const libre = await translateViaLibreTranslateVite(q, sourceLang)
    if (libre) return libre

    const memory = await translateViaMyMemory(q, sourceLang)
    if (memory) return memory

    if (attempt < maxAttempts - 1) {
      const wait = slowModeAtivo ? 1_400 + attempt * 1_600 : 700 + attempt * 1_100
      await sleep(wait)
    }
  }

  throw new IntegralTraducaoIndisponivelError()
}

async function translateLongText(
  text: string,
  sourceLang: string,
  onTrecho?: (atual: number, total: number) => void,
): Promise<string> {
  const chunks = splitChunks(text)
  const parts: string[] = []
  const pausa = slowModeAtivo ? CHUNK_PAUSE_SLOW_MS : CHUNK_PAUSE_MS
  for (let i = 0; i < chunks.length; i++) {
    onTrecho?.(i + 1, chunks.length)
    parts.push(await translateChunk(chunks[i]!, sourceLang))
    if (i < chunks.length - 1) await sleep(pausa)
  }
  return parts.join('\n\n')
}

export type TranslateCapitulosIntegralOptions = {
  slowMode?: boolean
  onProgress?: IntegralTranslateProgressFn
}

export async function translateCapitulosInBrowser(
  conteudoId: string,
  caps: ConteudoCapituloIntegral[],
  sourceLang: string,
  options?: TranslateCapitulosIntegralOptions | IntegralTranslateProgressFn,
): Promise<number> {
  const opts: TranslateCapitulosIntegralOptions =
    typeof options === 'function' ? { onProgress: options } : (options ?? {})
  slowModeAtivo = opts.slowMode !== false
  const onProgress = opts.onProgress

  let done = 0
  let traduzidosNovos = 0

  for (const cap of caps) {
    if (capituloPareceJaTraduzido(cap)) {
      done++
      onProgress?.(done, caps.length)
      continue
    }

    const original = cap.texto_pt?.trim() ?? ''
    if (!original) {
      done++
      onProgress?.(done, caps.length)
      continue
    }

    const capIdx = done + 1
    onProgress?.(capIdx, caps.length, `preparando capítulo ${cap.ordem}…`)

    const tituloPt = await translateLongText(
      cap.titulo.trim() || `Capítulo ${cap.ordem}`,
      sourceLang,
      (atual, total) => {
        onProgress?.(capIdx, caps.length, `título — parte ${atual} de ${total}`)
      },
    )
    const textoPt = await translateLongText(original, sourceLang, (atual, total) => {
      const varios = total > 1 ? ` — parte ${atual} de ${total}` : ''
      onProgress?.(capIdx, caps.length, `texto do capítulo ${cap.ordem}${varios}`)
    })

    if (!traducaoPareceValida(original, textoPt, sourceLang)) {
      throw new Error(
        'O tradutor devolveu texto igual ao original (nenhuma tradução aplicada). Aguarde 1–2 minutos, marque “Traduzir para português” e importe de novo.',
      )
    }

    const { error } = await supabase
      .from('conteudo_capitulos_integral')
      .update({
        titulo: tituloPt,
        texto_pt: textoPt,
        texto_origem: original,
      })
      .eq('id', cap.id)

    if (error) throw new Error(error.message)

    traduzidosNovos++
    done++
    onProgress?.(done, caps.length)
    await sleep(CHUNK_PAUSE_MS)
  }

  const comTexto = caps.filter((c) => (c.texto_pt?.trim().length ?? 0) > 0).length
  const precisava = sourceLang !== 'pt' ? comTexto : 0
  if (precisava > 0 && traduzidosNovos === 0 && !caps.some(capituloPareceJaTraduzido)) {
    throw new Error(
      'Nenhum capítulo foi traduzido (todos foram ignorados pelo sistema). Marque “Traduzir para português” e importe de novo.',
    )
  }

  if (traduzidosNovos > 0 || caps.some(capituloPareceJaTraduzido)) {
    await supabase
      .from('conteudos')
      .update({
        integral_traducao_metodo: 'preimportado',
        integral_traducao_credito: 'EntreLinhas (tradução automática)',
      })
      .eq('id', conteudoId)
  }

  return traduzidosNovos > 0 ? traduzidosNovos : done
}