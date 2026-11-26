import { isChapterLikeTitle } from './chapterTitles'
import { stripHtml } from './stripHtml'
import type { CapituloParsed } from './types'

const GUTENBERG_MAINTENANCE_RE =
  /Temporarily Down for Maintenance|perform maintenance/i

export function isGutenbergMaintenanceHtml(html: string): boolean {
  return GUTENBERG_MAINTENANCE_RE.test(html) && html.length < 8_000
}

/** Extrai ID numérico de URLs /ebooks/123 ou /ebooks/123.xxx */
export function gutenbergOrgEbookIdFromUrl(fonteUrl: string): string | null {
  try {
    const host = new URL(fonteUrl).hostname.toLowerCase()
    if (!host.includes('gutenberg.org') || host.includes('gutenberg.net.au')) return null
    const m = new URL(fonteUrl).pathname.match(/\/ebooks\/(\d+)(?:[./]|$)/i)
    return m?.[1] ?? null
  } catch {
    return null
  }
}

export function resolveGutenbergOrgReadingUrls(fonteUrl: string): string[] {
  const out: string[] = []
  try {
    const u = new URL(fonteUrl.trim())
    if (!u.hostname.toLowerCase().includes('gutenberg.org')) return [fonteUrl.trim()]
    const id = gutenbergOrgEbookIdFromUrl(fonteUrl)
    if (id) {
      out.push(
        `https://www.gutenberg.org/files/${id}/${id}-h/${id}-h.htm`,
        `https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`,
        `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
        `https://www.gutenberg.org/files/${id}/${id}.txt`,
      )
    }
    const path = u.pathname.toLowerCase()
    if (!path.endsWith('.txt') && !path.endsWith('.txt.utf-8')) {
      out.push(fonteUrl.trim())
    } else {
      out.unshift(fonteUrl.trim())
    }
    return [...new Set(out)]
  } catch {
    return [fonteUrl.trim()]
  }
}

const SKIP_ORG_H2 = /^(?:contents|the full project gutenberg license|project gutenberg)/i

function tituloFromOrgChapterInner(innerHtml: string, fallback: string): string {
  const h2 = innerHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
  const h3 = innerHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
  const raw = h2?.[1] ?? h3?.[1] ?? ''
  const titulo = stripHtml(raw).replace(/\s+/g, ' ').trim()
  if (titulo && !SKIP_ORG_H2.test(titulo)) return titulo
  return fallback
}

const ORG_CHAPTER_DIV_RE =
  /<div\s+class="chapter"[^>]*>([\s\S]*?)<\/div>\s*(?:<!--\s*end chapter\s*-->)?/gi

const AU_ANCHOR_TAG_RE = /<a\s+[^>]*(?:name|id)="([^"]+)"[^>]*>/gi

const AU_H2_SKIP =
  /^(?:contents|the end|author'?s note|project gutenberg|the full project gutenberg license)/i

/** h2 que costuma ser divisão de obra no Gutenberg AU (sem âncoras ch01/ppchap). */
const AU_H2_CHAPTER =
  /^(?:BOOK\s|CHAPTER\s|CHAPITRE\s|PART\s|CAPÍTULO\s|LIVRE\s|[IVXLC]+\.\s|(?:\d+\.\s))/i

function tituloAfterAnchor(html: string, anchorIndex: number, anchorName: string): string {
  const slice = html.slice(anchorIndex, anchorIndex + 1200)
  const h2 = slice.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
  if (h2?.[1]) {
    const t = stripHtml(h2[1]).replace(/\s+/g, ' ').trim()
    if (t && !/^the end$/i.test(t)) return t
  }
  const h3 = slice.match(/<h3[^>]*>([^<]*)<\/h3>/i)
  if (h3?.[1]) {
    const t = stripHtml(h3[1]).trim()
    if (t) return t
  }
  if (/ppded/i.test(anchorName)) return 'Dedicatória'
  const ppNum = anchorName.match(/chap(\d+)/i)?.[1]
  if (ppNum) return `Capítulo ${ppNum}`
  if (/^ch\d+$/i.test(anchorName)) {
    const n = Number.parseInt(anchorName.replace(/^ch/i, ''), 10)
    return Number.isFinite(n) ? `Capítulo ${n}` : anchorName
  }
  const pref = anchorName.match(/^([a-z]+)(\d+)$/i)
  if (pref) return `${pref[1]!.toUpperCase()} ${pref[2]}`
  return anchorName
}

function isGutenbergAustraliaDocument(html: string, fonteUrl?: string): boolean {
  if (fonteUrl) {
    try {
      if (new URL(fonteUrl).hostname.toLowerCase().includes('gutenberg.net.au')) return true
    } catch {
      /* noop */
    }
  }
  const head = html.slice(0, 16_000)
  return /gutenberg\.net\.au/i.test(head) || /Project Gutenberg Australia/i.test(head)
}

function listNamedAnchorsInOrder(html: string): { index: number; name: string }[] {
  const firstIndex = new Map<string, number>()
  for (const match of html.matchAll(AU_ANCHOR_TAG_RE)) {
    const name = (match[1] ?? '').trim()
    if (!name || firstIndex.has(name)) continue
    firstIndex.set(name, match.index ?? 0)
  }
  return [...firstIndex.entries()]
    .map(([name, index]) => ({ name, index }))
    .sort((a, b) => a.index - b.index)
}

/** AU usa ppchap (francês), ch01… (inglês) ou prefixo+ número (ex.: wolf1). */
function pickAustraliaChapterAnchors(
  html: string,
  fonteUrl?: string,
): { index: number; name: string }[] {
  const all = listNamedAnchorsInOrder(html)
  const auDoc = isGutenbergAustraliaDocument(html, fonteUrl)

  const pp = all.filter((a) => /^pp(?:ded|chap\d+)$/i.test(a.name))
  if (pp.length >= 1) return pp

  if (!auDoc) return []

  const ch = all.filter((a) => /^ch\d+$/i.test(a.name))
  if (ch.length >= 2) return ch

  const byPrefix = new Map<string, { index: number; name: string }[]>()
  for (const a of all) {
    if (!/^[a-z]{2,12}\d+$/i.test(a.name)) continue
    const prefix = a.name.replace(/\d+$/i, '').toLowerCase()
    const bucket = byPrefix.get(prefix) ?? []
    bucket.push(a)
    byPrefix.set(prefix, bucket)
  }
  let bestPrefixed: { index: number; name: string }[] = []
  for (const bucket of byPrefix.values()) {
    if (bucket.length >= 2 && bucket.length > bestPrefixed.length) bestPrefixed = bucket
  }
  if (bestPrefixed.length >= 2) return bestPrefixed.sort((a, b) => a.index - b.index)

  return []
}

function findPreambleEndIndex(html: string, firstChapterIndex: number): number {
  const start = html.search(/\*\*\* START OF (THE )?PROJECT GUTENBERG/i)
  const licenseEnd = html.search(/<\/table>/i)
  let from = 0
  if (start >= 0) from = Math.max(from, start)
  if (licenseEnd >= 0 && licenseEnd < firstChapterIndex) from = Math.max(from, licenseEnd)
  const body = html.search(/<body[^>]*>/i)
  if (body >= 0 && body < firstChapterIndex) from = Math.max(from, body)
  return Math.min(from, firstChapterIndex)
}

function capitulosFromHtmlMarkers(
  html: string,
  textoOrigem: string,
  markers: { index: number; titulo: string }[],
): CapituloParsed[] {
  if (markers.length === 0) return []

  const caps: CapituloParsed[] = []
  const preStart = findPreambleEndIndex(html, markers[0]!.index)
  const preTexto = stripHtml(html.slice(preStart, markers[0]!.index)).trim()
  if (preTexto.length >= 60) {
    caps.push({
      ordem: 1,
      titulo: 'Apresentação',
      texto_pt: preTexto,
      texto_origem: textoOrigem,
    })
  }

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i]!.index
    const end = i + 1 < markers.length ? markers[i + 1]!.index : html.length
    const texto = stripHtml(html.slice(start, end))
    if (texto.length < 20) continue
    caps.push({
      ordem: caps.length + 1,
      titulo: markers[i]!.titulo,
      texto_pt: texto,
      texto_origem: textoOrigem,
    })
  }

  return caps
}

function parseGutenbergAustraliaAnchors(
  html: string,
  textoOrigem: string,
  fonteUrl?: string,
): CapituloParsed[] {
  const anchors = pickAustraliaChapterAnchors(html, fonteUrl)
  const markers = anchors.map((a) => ({
    index: a.index,
    titulo: tituloAfterAnchor(html, a.index, a.name),
  }))
  if (markers.length >= 1) {
    const caps = capitulosFromHtmlMarkers(html, textoOrigem, markers)
    if (caps.length >= 2) return caps
  }
  if (!isGutenbergAustraliaDocument(html, fonteUrl)) return []
  return parseGutenbergAustraliaChapterH2(html, textoOrigem)
}

function parseGutenbergAustraliaChapterH2(html: string, textoOrigem: string): CapituloParsed[] {
  const markers: { index: number; titulo: string }[] = []
  for (const match of html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)) {
    const titulo = stripHtml(match[1] ?? '').replace(/\s+/g, ' ').trim()
    if (!titulo || AU_H2_SKIP.test(titulo)) continue
    if (!AU_H2_CHAPTER.test(titulo) && !isChapterLikeTitle(titulo)) continue
    markers.push({ index: match.index ?? 0, titulo })
  }
  if (markers.length < 2) return []
  return capitulosFromHtmlMarkers(html, textoOrigem, markers)
}

function parseGutenbergUsDivChapters(html: string, textoOrigem: string): CapituloParsed[] {
  const divMatches = [...html.matchAll(ORG_CHAPTER_DIV_RE)]
  if (divMatches.length < 2) return []

  const caps: CapituloParsed[] = []
  const firstIndex = divMatches[0]!.index ?? 0
  const preTexto = stripHtml(html.slice(0, firstIndex)).trim()
  if (preTexto.length >= 200) {
    caps.push({
      ordem: 1,
      titulo: 'Apresentação',
      texto_pt: preTexto,
      texto_origem: textoOrigem,
    })
  }

  for (let i = 0; i < divMatches.length; i++) {
    const inner = divMatches[i]![1] ?? ''
    const titulo = tituloFromOrgChapterInner(inner, `Capítulo ${i + 1}`)
    if (SKIP_ORG_H2.test(titulo) && !isChapterLikeTitle(titulo)) continue
    const texto = stripHtml(inner)
    if (texto.length < 40) continue
    caps.push({
      ordem: caps.length + 1,
      titulo,
      texto_pt: texto,
      texto_origem: textoOrigem,
    })
  }
  return caps.length >= 2 ? caps : []
}

/**
 * Gutenberg: Apresentação (sinopse/créditos) + 1 âncora/div = 1 página no leitor.
 * Não usa todos os h2 da página (evita título, autor e sumário como “capítulos” extras).
 */
export function parseGutenbergStyleHtml(
  html: string,
  textoOrigem: string,
  fonteUrl?: string,
): CapituloParsed[] {
  if (isGutenbergMaintenanceHtml(html)) return []

  const au = parseGutenbergAustraliaAnchors(html, textoOrigem, fonteUrl)
  if (au.length >= 2) return au

  const us = parseGutenbergUsDivChapters(html, textoOrigem)
  if (us.length >= 2) return us

  return []
}

/** HTML do Project Gutenberg US. */
export function parseGutenbergOrgHtml(
  html: string,
  textoOrigem: string,
  fonteUrl?: string,
): CapituloParsed[] {
  return parseGutenbergStyleHtml(html, textoOrigem, fonteUrl)
}