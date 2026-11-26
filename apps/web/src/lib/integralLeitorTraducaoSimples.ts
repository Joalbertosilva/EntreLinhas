import { supabase } from '@/lib/supabase'
import { inferirIdiomaOrigemTrecho } from '@/lib/integralTranslateHeuristics'

const CHUNK = 4_000
const PROXY = '/api/integral-translate'

const cacheMem = new Map<string, { titulo: string; corpo: string }>()

function cacheKey(conteudoId: string, pageId: string): string {
  return `integral-leitor-pt-v4:${conteudoId}:${pageId}`
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function partirTexto(texto: string, max = CHUNK): string[] {
  const t = texto.trim()
  if (!t) return []
  if (t.length <= max) return [t]

  const partes: string[] = []
  const blocos = t.split(/\n\s*\n/)
  let buf = ''

  for (const b of blocos) {
    const p = b.trim()
    if (!p) continue
    if (p.length > max) {
      if (buf) {
        partes.push(buf)
        buf = ''
      }
      for (let i = 0; i < p.length; i += max) {
        partes.push(p.slice(i, i + max))
      }
      continue
    }
    const next = buf ? `${buf}\n\n${p}` : p
    if (next.length > max && buf) {
      partes.push(buf)
      buf = p
    } else if (next.length > max) {
      partes.push(p)
    } else {
      buf = next
    }
  }
  if (buf) partes.push(buf)
  return partes.length > 0 ? partes : [t]
}

function mapFrom(idioma: string, amostra: string): string {
  const inf = inferirIdiomaOrigemTrecho(amostra, idioma)
  if (inf !== 'auto' && inf !== 'pt') return inf
  if (idioma !== 'auto' && idioma !== 'pt' && idioma !== 'desconhecido') return idioma
  return 'auto'
}

async function traduzirTrechoViaProxy(trecho: string, from: string): Promise<string> {
  const q = trecho.trim()
  if (!q) return ''
  const sl = from === 'pt' ? 'auto' : from
  const body = new URLSearchParams({ sl, tl: 'pt', q })

  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body,
  })

  const raw = await res.text()
  if (!res.ok) throw new Error('proxy-http')

  let json: { sentences?: Array<{ trans?: string }>; error?: string }
  try {
    json = JSON.parse(raw) as typeof json
  } catch {
    throw new Error('proxy-html')
  }

  if (json.error) throw new Error(json.error)
  const out = (json.sentences ?? [])
    .map((s) => s.trans ?? '')
    .join('')
    .trim()

  if (!out || out === q) throw new Error('traducao-igual')
  return out
}

async function traduzirViaServidor(
  titulo: string,
  corpo: string,
  idioma: string,
): Promise<{ titulo: string; corpo: string } | null> {
  try {
    const res = await supabase.functions.invoke('translate-leitor-pagina', {
      body: { titulo, corpo, idioma_origem: idioma },
    })
    if (res.error || res.data?.error) return null
    const corpoPt = typeof res.data?.corpo_pt === 'string' ? res.data.corpo_pt.trim() : ''
    if (!corpoPt || corpoPt === corpo.trim()) return null
    const tituloPt = typeof res.data?.titulo_pt === 'string' ? res.data.titulo_pt.trim() : titulo
    return { titulo: tituloPt || titulo, corpo: corpoPt }
  } catch {
    return null
  }
}

async function traduzirTrecho(trecho: string, from: string, tentativas = 3): Promise<string> {
  let last: unknown
  for (let i = 0; i < tentativas; i++) {
    try {
      return await traduzirTrechoViaProxy(trecho, from)
    } catch (e) {
      last = e
      if (i + 1 < tentativas) await sleep(400 + i * 600)
    }
  }
  throw last
}

async function traduzirLongo(texto: string, from: string): Promise<string> {
  const pedacos = partirTexto(texto)
  const saida: string[] = []
  for (let i = 0; i < pedacos.length; i++) {
    saida.push(await traduzirTrecho(pedacos[i]!, from))
    if (i + 1 < pedacos.length) await sleep(120)
  }
  return saida.join('\n\n')
}

export function lerTraducaoLeitorCacheSync(
  conteudoId: string,
  pageId: string,
  corpoOriginal: string,
): { titulo: string; corpo: string } | null {
  const k = cacheKey(conteudoId, pageId)
  const mem = cacheMem.get(k)
  if (mem?.corpo?.trim() && mem.corpo.trim() !== corpoOriginal.trim()) return mem
  try {
    const raw = sessionStorage.getItem(k)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { titulo: string; corpo: string }
    if (!parsed.corpo?.trim() || parsed.corpo.trim() === corpoOriginal.trim()) return null
    cacheMem.set(k, parsed)
    return parsed
  } catch {
    return null
  }
}

export function limparCacheTraducaoLeitor(conteudoId: string, pageId: string): void {
  cacheMem.delete(cacheKey(conteudoId, pageId))
  try {
    sessionStorage.removeItem(cacheKey(conteudoId, pageId))
  } catch {
    /* quota */
  }
}

function gravarCache(conteudoId: string, pageId: string, val: { titulo: string; corpo: string }): void {
  const k = cacheKey(conteudoId, pageId)
  cacheMem.set(k, val)
  try {
    sessionStorage.setItem(k, JSON.stringify(val))
  } catch {
    /* quota */
  }
}

export async function traduzirPaginaLeitorSimples(input: {
  conteudoId: string
  pageId: string
  titulo: string
  corpo: string
  idiomaOrigem: string
  forcar?: boolean
}): Promise<{ titulo: string; corpo: string }> {
  const { conteudoId, pageId, titulo, corpo, idiomaOrigem, forcar } = input
  const corpoTrim = corpo.trim()

  if (!corpoTrim) return { titulo, corpo: corpoTrim }

  if (inferirIdiomaOrigemTrecho(corpoTrim, idiomaOrigem) === 'pt') {
    return { titulo, corpo: corpoTrim }
  }

  if (!forcar) {
    const hit = lerTraducaoLeitorCacheSync(conteudoId, pageId, corpoTrim)
    if (hit) return hit
  }

  if (import.meta.env.PROD) {
    const srv = await traduzirViaServidor(titulo, corpoTrim, idiomaOrigem)
    if (srv) {
      gravarCache(conteudoId, pageId, srv)
      return srv
    }
  }

  const from = mapFrom(idiomaOrigem, corpoTrim)
  let corpoPt: string
  let tituloPt: string
  try {
    ;[corpoPt, tituloPt] = await Promise.all([
      traduzirLongo(corpoTrim, from),
      titulo.trim() ? traduzirTrecho(titulo, from) : Promise.resolve(titulo),
    ])
  } catch {
    const srv = await traduzirViaServidor(titulo, corpoTrim, idiomaOrigem)
    if (srv) {
      gravarCache(conteudoId, pageId, srv)
      return srv
    }
    throw new Error('traducao-falhou')
  }

  const out = { titulo: tituloPt || titulo, corpo: corpoPt }
  gravarCache(conteudoId, pageId, out)
  return out
}

let preaquecerFila: Promise<void> = Promise.resolve()
const preaquecerKeys = new Set<string>()

/** Pré-traduz no máximo um capítulo por vez (evita cancelar a página atual). */
export function preaquecerTraducaoCapitulosLeitor(
  conteudoId: string,
  paginas: Array<{ id: string; titulo: string; corpo: string; kind?: string }>,
  idiomaOrigem: string,
  prioridadePageId?: string,
): void {
  const lista = paginas.filter((p) => p.kind !== 'cover' && p.corpo.trim().length > 0)
  const ordenadas = [...lista].sort((a, b) => {
    if (a.id === prioridadePageId) return -1
    if (b.id === prioridadePageId) return 1
    return 0
  })

  for (const p of ordenadas) {
    const k = `${conteudoId}:${p.id}`
    if (preaquecerKeys.has(k)) continue
    if (lerTraducaoLeitorCacheSync(conteudoId, p.id, p.corpo.trim())) continue
    preaquecerKeys.add(k)
    preaquecerFila = preaquecerFila.then(async () => {
      try {
        await traduzirPaginaLeitorSimples({
          conteudoId,
          pageId: p.id,
          titulo: p.titulo,
          corpo: p.corpo,
          idiomaOrigem,
        })
      } catch {
        /* fila continua */
      } finally {
        preaquecerKeys.delete(k)
      }
    })
  }
}