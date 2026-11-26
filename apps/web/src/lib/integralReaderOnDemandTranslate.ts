import translate from 'google-translate-api-x'
import { supabase } from '@/lib/supabase'
import {
  inferirIdiomaOrigemTrecho,
  parecePortugues,
  traducaoPaginaLeitorCacheValida,
  traducaoPareceValida,
} from '@/lib/integralTranslateHeuristics'

export type PaginaTraduzidaLeitor = { titulo: string; corpo: string }

/** Folhas do leitor: um pedido por trecho (~3,8k chars). */
const CHUNK = 3_800
const memoria = new Map<string, PaginaTraduzidaLeitor>()
const emVoo = new Map<string, Promise<PaginaTraduzidaLeitor>>()

let slotsNavegador = 0
const MAX_SLOTS_NAVEGADOR = 2

const FETCH_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  'User-Agent': 'Mozilla/5.0 (compatible; EntreLinhas-Leitor/1.0; educational translation)',
}

function cacheKey(conteudoId: string, pageId: string): string {
  return `integral-leitor-pt:${conteudoId}:${pageId}`
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function comSlotNavegador<T>(fn: () => Promise<T>): Promise<T> {
  while (slotsNavegador >= MAX_SLOTS_NAVEGADOR) {
    await sleep(60)
  }
  slotsNavegador++
  try {
    return await fn()
  } finally {
    slotsNavegador--
  }
}

export function invalidarCachePaginaLeitor(conteudoId: string, pageId: string): void {
  const k = cacheKey(conteudoId, pageId)
  memoria.delete(k)
  emVoo.delete(k)
  try {
    sessionStorage.removeItem(k)
  } catch {
    /* ignore */
  }
}

export function lerPaginaTraduzidaCache(
  conteudoId: string,
  pageId: string,
  corpoOriginal?: string,
  idiomaOrigem?: string,
): PaginaTraduzidaLeitor | null {
  const k = cacheKey(conteudoId, pageId)
  const hit = memoria.get(k)
  if (hit) {
    if (
      corpoOriginal != null &&
      idiomaOrigem != null &&
      !traducaoPaginaLeitorCacheValida(corpoOriginal, hit, idiomaOrigem)
    ) {
      invalidarCachePaginaLeitor(conteudoId, pageId)
      return null
    }
    return hit
  }
  try {
    const raw = sessionStorage.getItem(k)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PaginaTraduzidaLeitor
    if (parsed?.corpo == null) return null
    if (
      corpoOriginal != null &&
      idiomaOrigem != null &&
      !traducaoPaginaLeitorCacheValida(corpoOriginal, parsed, idiomaOrigem)
    ) {
      sessionStorage.removeItem(k)
      return null
    }
    memoria.set(k, parsed)
    return parsed
  } catch {
    /* ignore */
  }
  return null
}

function gravarCache(
  conteudoId: string,
  pageId: string,
  val: PaginaTraduzidaLeitor,
  corpoOriginal: string,
  idiomaOrigem: string,
): void {
  if (!traducaoPaginaLeitorCacheValida(corpoOriginal, val, idiomaOrigem)) return
  const k = cacheKey(conteudoId, pageId)
  memoria.set(k, val)
  try {
    sessionStorage.setItem(k, JSON.stringify(val))
  } catch {
    /* quota */
  }
}

function mapFrom(idioma: string, texto?: string): string {
  if (idioma === 'pt' || idioma === 'desconhecido' || idioma === 'origem') return 'auto'
  if (idioma !== 'auto' && idioma) return idioma
  if (texto?.trim()) return inferirIdiomaOrigemTrecho(texto, 'auto')
  return 'auto'
}

function devePularTraducao(corpo: string, titulo: string, idiomaOrigem: string): boolean {
  if (idiomaOrigem === 'pt') return true
  const corpoTrim = corpo.trim()
  if (!corpoTrim) return true
  if (idiomaOrigem !== 'auto' && idiomaOrigem !== 'desconhecido' && idiomaOrigem !== 'origem') {
    return false
  }
  return parecePortugues(corpoTrim) && (!titulo.trim() || parecePortugues(titulo))
}

function partesTexto(texto: string, max = CHUNK): string[] {
  const trimmed = texto.trim()
  if (!trimmed) return []
  if (trimmed.length <= max) return [trimmed]

  const parts: string[] = []
  const paragraphs = trimmed.split(/\n\s*\n/)
  let buf = ''

  for (const p of paragraphs) {
    const block = p.trim()
    if (!block) continue

    if (block.length > max) {
      if (buf) {
        parts.push(buf)
        buf = ''
      }
      for (let i = 0; i < block.length; i += max) {
        let slice = block.slice(i, i + max)
        if (i + max < block.length) {
          const lastSpace = slice.lastIndexOf(' ')
          if (lastSpace > max * 0.55) slice = slice.slice(0, lastSpace).trim()
        }
        if (slice.length >= 8) parts.push(slice)
      }
      continue
    }

    const next = buf ? `${buf}\n\n${block}` : block
    if (next.length > max && buf) {
      parts.push(buf.trim())
      buf = block
    } else if (next.length > max) {
      parts.push(block)
    } else {
      buf = next
    }
  }
  if (buf.trim()) parts.push(buf.trim())
  return parts.length > 0 ? parts : [trimmed]
}

async function traduzirViaAtFetch(texto: string, idioma: string): Promise<string | null> {
  const q = texto.trim()
  if (!q) return ''
  const sl = mapFrom(idioma, q)
  const body = new URLSearchParams({ sl, tl: 'pt', q })
  const url = 'https://translate.google.com/translate_a/single?client=at&dt=t&dt=rm&dj=1'

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: FETCH_HEADERS,
      body,
    })
    if (!res.ok) return null
    const raw = await res.text()
    if (raw.startsWith('<') || raw.includes('Sorry')) return null
    const json = JSON.parse(raw) as { sentences?: Array<{ trans?: string }> }
    const out = (json.sentences ?? [])
      .map((s) => s.trans ?? '')
      .join('')
      .trim()
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

async function traduzirViaMyMemory(texto: string, idioma: string): Promise<string | null> {
  const q = texto.trim()
  if (!q) return ''
  const slRaw = mapFrom(idioma, q)
  const sl = slRaw === 'auto' ? 'en' : slRaw
  const pedacos = partesTexto(q, 450)
  const saida: string[] = []

  try {
    for (let i = 0; i < pedacos.length; i++) {
      const trecho = pedacos[i]!
      const params = new URLSearchParams({ q: trecho, langpair: `${sl}|pt` })
      const res = await fetch(`https://api.mymemory.translated.net/get?${params}`)
      if (!res.ok) return null
      const json = (await res.json()) as {
        responseData?: { translatedText?: string }
        quotaFinished?: boolean
      }
      const out = json.responseData?.translatedText?.trim() ?? ''
      if (!out || out.includes('MYMEMORY WARNING') || json.quotaFinished) return null
      saida.push(out)
      if (i + 1 < pedacos.length) await sleep(220)
    }
    const merged = saida.join(' ').trim()
    return merged.length > 0 ? merged : null
  } catch {
    return null
  }
}

async function traduzirViaLib(texto: string, idioma: string): Promise<string | null> {
  const q = texto.trim()
  if (!q) return ''
  try {
    const res = await translate(q, {
      to: 'pt',
      from: mapFrom(idioma, q),
      fallbackBatch: true,
      forceBatch: q.length > 3_200,
    })
    const out = res.text.trim()
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

async function traduzirTrechoRapido(texto: string, idioma: string): Promise<string> {
  const q = texto.trim()
  if (!q) return ''

  return comSlotNavegador(async () => {
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const at = await traduzirViaAtFetch(q, idioma)
      if (at && traducaoPareceValida(q, at, idioma)) return at
      if (at && at !== q && q.length < 48) return at

      const lib = await traduzirViaLib(q, idioma)
      if (lib && traducaoPareceValida(q, lib, idioma)) return lib
      if (lib && lib !== q && q.length < 48) return lib

      const mem = await traduzirViaMyMemory(q, idioma)
      if (mem && traducaoPareceValida(q, mem, idioma)) return mem
      if (mem && mem !== q && q.length < 48) return mem

      const srvChunk =
        q.length <= 4_000
          ? await traduzirViaServidorTrecho(q, idioma)
          : null
      if (srvChunk && traducaoPareceValida(q, srvChunk, idioma)) return srvChunk

      if (tentativa < 4) await sleep(600 + tentativa * 700)
    }
    throw new Error('trecho-falhou')
  })
}

async function traduzirCorpoParalelo(corpo: string, idioma: string): Promise<string> {
  const partes = partesTexto(corpo)
  if (partes.length === 0) return ''
  if (partes.length === 1) return traduzirTrechoRapido(partes[0]!, idioma)

  const resultados: string[] = []
  for (const parte of partes) {
    resultados.push(await traduzirTrechoRapido(parte, idioma))
    await sleep(120)
  }
  return resultados.join('\n\n')
}

async function traduzirViaServidorTrecho(texto: string, idioma: string): Promise<string | null> {
  try {
    const res = await supabase.functions.invoke('translate-integral-texto', {
      body: { texto: texto.trim().slice(0, 12_000), idioma_origem: idioma },
    })
    if (res.error || res.data?.error) return null
    const out = typeof res.data?.texto_pt === 'string' ? res.data.texto_pt.trim() : ''
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

async function viaServidorPagina(titulo: string, corpo: string, idioma: string): Promise<PaginaTraduzidaLeitor | null> {
  const payload = {
    titulo: titulo.trim(),
    corpo: corpo.trim(),
    idioma_origem: idioma,
  }

  const tentativas: Array<{
    fn: 'translate-leitor-pagina' | 'translate-integral-texto'
    body: Record<string, string>
  }> = [
    { fn: 'translate-leitor-pagina', body: payload },
  ]
  if (payload.corpo.length <= 8_000) {
    tentativas.push({
      fn: 'translate-integral-texto',
      body: { texto: payload.corpo, idioma_origem: idioma },
    })
  }

  for (const { fn, body } of tentativas) {
    const res = await supabase.functions.invoke(fn, { body })
    if (res.error || res.data?.error) continue

    if (fn === 'translate-leitor-pagina') {
      const tituloPt = typeof res.data?.titulo_pt === 'string' ? res.data.titulo_pt.trim() : ''
      const corpoPt = typeof res.data?.corpo_pt === 'string' ? res.data.corpo_pt.trim() : ''
      if (!corpoPt) continue
      if (!traducaoPareceValida(corpo, corpoPt, idioma) && corpo.length > 80) continue
      return { titulo: tituloPt || titulo, corpo: corpoPt }
    }

    const corpoPt = typeof res.data?.texto_pt === 'string' ? res.data.texto_pt.trim() : ''
    if (!corpoPt) continue
    if (!traducaoPareceValida(corpo, corpoPt, idioma) && corpo.length > 80) continue
    let tituloPt = titulo
    if (titulo.trim()) {
      try {
        tituloPt = await traduzirTrechoRapido(titulo, idioma)
      } catch {
        tituloPt = titulo
      }
    }
    return { titulo: tituloPt, corpo: corpoPt }
  }

  return null
}

async function traduzirNavegadorPagina(titulo: string, corpo: string, idioma: string): Promise<PaginaTraduzidaLeitor> {
  const [tituloPt, corpoPt] = await Promise.all([
    titulo.trim() ? traduzirTrechoRapido(titulo, idioma) : Promise.resolve(titulo),
    traduzirCorpoParalelo(corpo, idioma),
  ])
  if (!traducaoPareceValida(corpo, corpoPt, idioma) && corpo.length > 60) {
    if (parecePortugues(corpoPt) && corpoPt.trim() !== corpo.trim()) {
      return { titulo: tituloPt || titulo, corpo: corpoPt }
    }
    throw new Error('traducao-invalida')
  }
  return { titulo: tituloPt || titulo, corpo: corpoPt || corpo }
}

async function executarTraducao(
  titulo: string,
  corpo: string,
  idiomaOrigem: string,
): Promise<PaginaTraduzidaLeitor> {
  const srv = await viaServidorPagina(titulo, corpo, idiomaOrigem)
  if (srv && traducaoPaginaLeitorCacheValida(corpo, srv, idiomaOrigem)) {
    return srv
  }

  try {
    return await traduzirNavegadorPagina(titulo, corpo, idiomaOrigem)
  } catch {
    if (srv) return srv
    throw new Error('traducao-falhou')
  }
}

function obterOuIniciar(
  conteudoId: string,
  pageId: string,
  titulo: string,
  corpo: string,
  idiomaOrigem: string,
  forcar = false,
): Promise<PaginaTraduzidaLeitor> {
  const k = cacheKey(conteudoId, pageId)
  const corpoTrim = corpo.trim()

  if (forcar) invalidarCachePaginaLeitor(conteudoId, pageId)

  const cached = lerPaginaTraduzidaCache(conteudoId, pageId, corpoTrim, idiomaOrigem)
  if (cached && !forcar) return Promise.resolve(cached)

  const existente = emVoo.get(k)
  if (existente && !forcar) return existente

  if (devePularTraducao(corpoTrim, titulo, idiomaOrigem)) {
    return Promise.resolve({ titulo, corpo: corpoTrim })
  }

  const TRADUCAO_MS = 180_000
  const promessa = Promise.race([
    executarTraducao(titulo, corpoTrim, idiomaOrigem),
    sleep(TRADUCAO_MS).then(() => {
      throw new Error('traducao-timeout')
    }),
  ])
    .then((out) => {
      gravarCache(conteudoId, pageId, out, corpoTrim, idiomaOrigem)
      return out
    })
    .finally(() => {
      emVoo.delete(k)
    })

  emVoo.set(k, promessa)
  return promessa
}

export function traduzirPaginaLeitor(
  conteudoId: string,
  pageId: string,
  titulo: string,
  corpo: string,
  idiomaOrigem = 'auto',
  forcar = false,
): Promise<PaginaTraduzidaLeitor> {
  return obterOuIniciar(conteudoId, pageId, titulo, corpo, idiomaOrigem, forcar)
}

/** Pré-carrega só a próxima folha — evita bloqueio por excesso de pedidos ao tradutor. */
export function preaquecerTraducaoPaginas(
  conteudoId: string,
  folhas: Array<{ id: string; titulo: string; corpo: string }>,
  idiomaOrigem: string,
): void {
  for (const f of folhas) {
    if (lerPaginaTraduzidaCache(conteudoId, f.id, f.corpo, idiomaOrigem)) continue
    void obterOuIniciar(conteudoId, f.id, f.titulo, f.corpo, idiomaOrigem)
  }
}