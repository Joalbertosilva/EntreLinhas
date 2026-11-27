import {
  cleanDominioPublicoPdfText,
  countMecCapituloHeadings,
  isDominioPublicoPdfLikeText,
  stripNeadFromChunk,
  tituloFromMecCapituloPart,
  trimMecPdfPreamble,
} from './cleanPdfText'
import {
  hasIntegralPageMarkers,
  inferIntegralDivisaoModo,
  spacingIntegralPageMarkers,
  stripIntegralPageMarkers,
} from './pageMarkers'
import { isChapterLikeTitle } from './chapterTitles'
import {
  isPdfTableOfContentsLine,
  normalizePortugueseChapterTitle,
  stripPdfTocLines,
} from './pdfToc'
import { expandCapitulosSeHeadingsEmbutidos } from './chapterResplit'
import { normalizePdfExtractedPageText } from './pdfTextNormalize'
import { textoUnificadoFromPdfMarcadores, trimIntegralNarrativaInicio } from './pdfChapterExtract'
import {
  isGutenbergMaintenanceHtml,
  parseGutenbergOrgHtml,
  parseGutenbergStyleHtml,
} from './gutenbergHtml'
import { stripHtml } from './stripHtml'
import type { CapituloParsed } from './types'

export {
  expandCapitulosParaFolhasLeitura,
  INTEGRAL_FOLHA_MAX_CHARS,
  INTEGRAL_FOLHA_MIN_SPLIT,
  splitTextoEmFolhasLeitura,
} from './readingPages'

export {
  normalizeIntegralReadingText,
  normalizePdfExtractedPageText,
} from './pdfTextNormalize'
export {
  cleanDominioPublicoPdfText,
  cleanDominioPublicoPdfPageText,
  countMecCapituloHeadings,
  isDominioPublicoPdfLikeText,
  stripNeadFromChunk,
  tituloFromMecCapituloPart,
  trimMecPdfPreamble,
} from './cleanPdfText'
export {
  hasIntegralPageMarkers,
  inferIntegralDivisaoModo,
  integralPageMarker,
  stripIntegralPageMarkers,
  type IntegralDivisaoModo,
} from './pageMarkers'

export type { CapituloParsed } from './types'
export { stripHtml } from './stripHtml'
export {
  gutenbergOrgEbookIdFromUrl,
  isGutenbergMaintenanceHtml,
  parseGutenbergOrgHtml,
  parseGutenbergStyleHtml,
  resolveGutenbergOrgReadingUrls,
} from './gutenbergHtml'
export { isChapterLikeTitle } from './chapterTitles'
export {
  MIN_OBRA_TEXTO_CHARS,
  integralLinkDownloadCandidates,
  obraIntegralTextoPareceCompleto,
} from './linkFetch'

export function integralImportPareceDegradado(capitulos: CapituloParsed[]): boolean {
  if (capitulos.length === 0) return true
  const totalChars = capitulos.reduce((s, c) => s + c.texto_pt.trim().length, 0)
  const modo = inferIntegralDivisaoModo(capitulos)

  if (capitulos.some((c) => isGutenbergMaintenanceHtml(c.texto_pt))) return true

  if (capitulos.length === 1) {
    const unico = capitulos[0]!
    if (/^Texto integral$/i.test(unico.titulo.trim()) && totalChars < 55_000) return true
    return false
  }

  // PDF: 1 folha = 1 trecho — várias páginas com texto distribuído é válido.
  if (modo === 'paginas' && capitulos.length >= 6) return false
  if (modo === 'paginas' && capitulos.length >= 3) {
    const media = totalChars / capitulos.length
    if (media < 12_000) return false
  }

  // Obra longa virou só 2 “páginas” (PDF) ou pouquíssimos trechos — divisão falhou.
  if (modo === 'paginas' && capitulos.length < 6 && totalChars > 6_000) return true
  if (modo === 'partes' && capitulos.length <= 3 && totalChars > 12_000) return true
  if (
    capitulos.length <= 2 &&
    capitulos.every((c) => /^Texto integral/i.test(c.titulo.trim())) &&
    totalChars > 4_000
  ) {
    return true
  }

  if (modo === 'capitulos' && capitulos.length >= 2) return false
  if (modo === 'paginas' && capitulos.length <= 4) return true
  if (modo === 'paginas') return false
  return false
}

export function guessIdiomaIntegralCapitulos(capitulos: CapituloParsed[]): string {
  const amostra = capitulos
    .slice(0, 4)
    .map((c) => c.texto_pt)
    .join(' ')
    .slice(0, 2500)
  if (/\b(capitulo|capítulo|não|também|porque|uma|dos)\b/i.test(amostra)) return 'pt'
  if (
    /[àâçéèêëîïôûù]/i.test(amostra) &&
    (/\b(chapitre|premier|être)\b/i.test(amostra) || /\b(le|la|les|des|une)\b/i.test(amostra))
  ) {
    return 'fr'
  }
  if (/\b(the|and|chapter|was|were)\b/i.test(amostra)) return 'en'
  return 'auto'
}

/** Obras HTML no Project Gutenberg Australia (/ebooks/*.html, âncoras ppchap). */
export function parseGutenbergAuHtml(html: string, textoOrigem: string, fonteUrl?: string): CapituloParsed[] {
  return parseGutenbergStyleHtml(html, textoOrigem, fonteUrl)
}

function trimGutenbergWrapper(text: string): string {
  let body = text.replace(/^\uFEFF/, "");
  const start = body.search(/\*\*\* START OF (THE )?PROJECT GUTENBERG/i);
  if (start >= 0) {
    const after = body.slice(start).replace(/^\*\*\* START OF (THE )?PROJECT GUTENBERG.*$/im, "");
    body = after;
  }
  const end = body.search(/\*\*\* END OF (THE )?PROJECT GUTENBERG/i);
  if (end >= 0) body = body.slice(0, end);
  return body.trim();
}

const CHAPTER_HEADING =
  /^(?:(?:CHAPTER|CHAPITRE|Capítulo|CAPÍTULO|LIVRO|Livro|PREMIER|DEUXIÈME|TROISIÈME)\s+(?:[IVXLCDM]+|\d+)(?:\.|:)?(?:\s*[—–-]\s*|\s+)[^\n]{0,120}|(?:CAPÍTULO|Capítulo)\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]+)(?:\s*\/\s*.+|\s+DO\s+.+|\s+[.—–-]\s*.+)?|(?:CHAPTER|CHAPITRE|Capítulo|CAPÍTULO)\s+[A-Za-zÀ-ÿ][^\n]{0,80})$/i;

const MEC_CAPITULO_SPLIT =
  /(?=\bCAP[ÍI]TULO\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]{1,7})\b)/i;

const PT_CAPITULO_SPLIT =
  /(?=\bCapítulo\s+(?:[IVXLCDM]{1,7}|\d{1,3})\b)/i;

const PT_CAPITULO_TITLE = /^Capítulo\s+(?:[IVXLCDM]{1,7}|\d{1,3})/i;

const PAGE_MARKER_CAPTURE = /\[\[INTEGRAL_PAG:(\d+)\]\]|⧗INTEGRAL_PAG:(\d+)⧗/g

const DIARIO_DATA_MARK =
  /(?:^|\n)(\d{1,2}\s+de\s+(?:janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro))(?=[\s,.])/gi

/** Só trata como capítulos MEC quando há vários títulos explícitos (evita 2 blocos falsos no PDF). */
function capitulosMecReais(caps: CapituloParsed[]): boolean {
  if (caps.length < 5) return false
  const comTituloMec = caps.filter((c) => /\bCAP[ÍI]TULO\b/i.test(c.titulo)).length
  return comTituloMec >= 3
}

function capituloTituloPareceLixo(titulo: string): boolean {
  return /\.{2,}/.test(titulo) || isPdfTableOfContentsLine(titulo)
}

function capitulosPortuguesReais(caps: CapituloParsed[]): boolean {
  if (caps.length < 3) return false
  const comTitulo = caps.filter(
    (c) => PT_CAPITULO_TITLE.test(c.titulo.trim()) && !capituloTituloPareceLixo(c.titulo),
  ).length
  const mediaCorpo =
    caps.reduce((s, c) => s + c.texto_pt.trim().length, 0) / Math.max(caps.length, 1)
  if (comTitulo >= 8 && mediaCorpo >= 900) return true
  return comTitulo >= Math.min(3, Math.ceil(caps.length * 0.5)) && mediaCorpo >= 400
}

function tituloFromPortugueseCapituloPart(part: string): string {
  const headLine = part.split(/\r?\n/).find((l) => l.trim().length > 0)?.trim() ?? ''
  if (PT_CAPITULO_TITLE.test(headLine)) return normalizePortugueseChapterTitle(headLine)
  const m = part.slice(0, 200).match(PT_CAPITULO_TITLE)
  if (m) return normalizePortugueseChapterTitle(m[0])
  return 'Capítulo'
}

function parsePortugueseCapitulosPdf(body: string, textoOrigem: string): CapituloParsed[] {
  const unificado = hasIntegralPageMarkers(body)
    ? trimIntegralNarrativaInicio(textoUnificadoFromPdfMarcadores(body))
    : body
  const stripped = stripPdfTocLines(
    hasIntegralPageMarkers(body) ? unificado : stripIntegralPageMarkers(unificado),
  )
  const cleaned = hasIntegralPageMarkers(body)
    ? trimIntegralNarrativaInicio(stripped)
    : cleanDominioPublicoPdfText(stripped)
  const parts = cleaned
    .split(PT_CAPITULO_SPLIT)
    .map((p) => p.trim())
    .filter((p) => p.length >= 80)
  if (parts.length === 0) return []

  return parts
    .filter((part) => PT_CAPITULO_TITLE.test(part.trim().slice(0, 60)))
    .map((part, idx) => ({
      ordem: idx + 1,
      titulo: tituloFromPortugueseCapituloPart(part),
      texto_pt: normalizePdfExtractedPageText(stripNeadFromChunk(part)),
      texto_origem: textoOrigem,
    }))
}

function tituloPaginaPdf(chunk: string, pageNum: number, fallbackIndex: number): string {
  const head = chunk.trim().slice(0, 280)
  const firstLine = head.split(/\r?\n/).find((l) => l.trim().length > 0)?.trim() ?? head
  const collapsed = firstLine.replace(/\s+/g, ' ')
  const cap =
    collapsed.match(/^(?:Capítulo|CAPÍTULO)\s+(?:[IVXLCDM]+|\d{1,3})(?:\b|[.:—–-])/i) ??
    head.match(/\b(?:Capítulo|CAPÍTULO)\s+(?:[IVXLCDM]+|\d{1,3})\b/i)
  if (cap) return normalizePortugueseChapterTitle(cap[0])
  const n = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : fallbackIndex + 1
  return `Página ${n}`
}

function parseIntegralPaginas(body: string, textoOrigem: string): CapituloParsed[] {
  const matches = [...body.matchAll(PAGE_MARKER_CAPTURE)]
  if (matches.length === 0) return []

  const capitulos: CapituloParsed[] = []
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!
    const pageNum = Number.parseInt(match[1] ?? match[2] ?? '0', 10)
    const start = (match.index ?? 0) + match[0].length
    const end =
      i + 1 < matches.length ? (matches[i + 1]!.index ?? body.length) : body.length
    let chunk = body.slice(start, end).trim()
    chunk = normalizePdfExtractedPageText(stripNeadFromChunk(chunk))
    if (chunk.length < 1) {
      chunk = '—'
    }
    const titulo = tituloPaginaPdf(chunk, pageNum, i)
    capitulos.push({
      ordem: capitulos.length + 1,
      titulo,
      texto_pt: chunk,
      texto_origem: textoOrigem,
    })
  }

  if (capitulos.length === 0) {
    const beforeFirst = body.slice(0, matches[0]!.index ?? 0).trim()
    const cleaned = stripNeadFromChunk(beforeFirst)
    if (cleaned.length >= 80) {
      capitulos.push({
        ordem: 1,
        titulo: 'Página 1',
        texto_pt: cleaned,
        texto_origem: textoOrigem,
      })
    }
  }

  return capitulos.filter((c) => c.texto_pt.trim().length >= 1)
}

/** Descarta trechos vazios e renumera — 1 capítulo Gutenberg = 1 página (sem subdividir). */
export function finalizeCapitulosParsed(capitulos: CapituloParsed[]): CapituloParsed[] {
  const modoPaginas =
    capitulos.length > 0 &&
    capitulos.every((c) => {
      const t = c.titulo.trim()
      return /^Página\s+\d+$/i.test(t) || /^(?:Capítulo|CAPÍTULO)\s+/i.test(t)
    })
  const min = modoPaginas ? 1 : 12
  return capitulos
    .filter(
      (c) =>
        c.texto_pt.trim().length >= min ||
        /^Apresentação$/i.test(c.titulo.trim()),
    )
    .map((c, idx) => ({ ...c, ordem: idx + 1 }))
}

function shouldPreferPaginas(caps: CapituloParsed[], body: string): boolean {
  if (!hasIntegralPageMarkers(body)) return false
  if (capitulosMecReais(caps)) return false
  const modo = inferIntegralDivisaoModo(caps)
  if (modo === 'capitulos' && caps.length >= 2) return false
  if (modo === 'partes' && caps.length >= 3) return false
  if (caps.length >= 2 && !/^Texto integral$/i.test(caps[0]?.titulo?.trim() ?? '')) return false
  return true
}

function applyPaginasSeNecessario(
  caps: CapituloParsed[],
  body: string,
  textoOrigem: string,
): CapituloParsed[] {
  if (!shouldPreferPaginas(caps, body)) return caps
  const paginas = parseIntegralPaginas(body, textoOrigem)
  if (paginas.length >= 2) return paginas
  return caps
}

function parseDiarioPorData(body: string, textoOrigem: string): CapituloParsed[] {
  const matches = [...body.matchAll(DIARIO_DATA_MARK)]
  if (matches.length < 3) return []

  const capitulos: CapituloParsed[] = []
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!
    const titulo = (match[1] ?? '').trim()
    if (!titulo) continue
    const start = match.index ?? 0
    const end = i + 1 < matches.length ? (matches[i + 1]!.index ?? body.length) : body.length
    const chunk = stripNeadFromChunk(body.slice(start, end).trim())
    if (chunk.length < 40) continue
    capitulos.push({
      ordem: capitulos.length + 1,
      titulo,
      texto_pt: chunk,
      texto_origem: textoOrigem,
    })
  }
  return capitulos.filter((c) => c.texto_pt.length >= 40)
}

function parseMecCapitulos(body: string, textoOrigem: string): CapituloParsed[] {
  const parts = body
    .split(MEC_CAPITULO_SPLIT)
    .map((p) => trimMecPdfPreamble(p))
    .filter((p) => p.length >= 40);
  if (parts.length === 0) return [];
  return parts.map((part, idx) => ({
    ordem: idx + 1,
    titulo: tituloFromMecCapituloPart(part),
    texto_pt: normalizePdfExtractedPageText(stripNeadFromChunk(part)),
    texto_origem: textoOrigem,
  }));
}

/** Texto plano (.txt) — capítulos por linhas-título (Gutenberg, Domínio Público exportado). */
export function parsePlainTextCapitulos(text: string, textoOrigem: string): CapituloParsed[] {
  const rawWithMarkers = text
  let body = trimGutenbergWrapper(text)
  const textoMarcadores = hasIntegralPageMarkers(body) ? spacingIntegralPageMarkers(body) : body
  const semMarcadores = stripIntegralPageMarkers(body)
  const mecStyle = isDominioPublicoPdfLikeText(semMarcadores)
  body = mecStyle ? cleanDominioPublicoPdfText(semMarcadores) : semMarcadores
  if (body.length < 80 && !hasIntegralPageMarkers(rawWithMarkers)) return []

  if (hasIntegralPageMarkers(rawWithMarkers)) {
    const paginas = finalizeCapitulosParsed(parseIntegralPaginas(textoMarcadores, textoOrigem))
    return paginas
  }

  const capHeadingCount = countMecCapituloHeadings(body)
  if (!hasIntegralPageMarkers(rawWithMarkers)) {
    const ptCaps = parsePortugueseCapitulosPdf(body, textoOrigem)
    if (capitulosPortuguesReais(ptCaps)) return ptCaps
  }

  if (mecStyle || capHeadingCount >= 2) {
    const mecCaps = parseMecCapitulos(body, textoOrigem)
    if (capitulosMecReais(mecCaps)) return mecCaps
    if (mecCaps.length === 1) {
      const upgraded = applyPaginasSeNecessario(mecCaps, textoMarcadores, textoOrigem)
      if (upgraded.length >= 2 || inferIntegralDivisaoModo(upgraded) === 'paginas') return upgraded
    }
  }

  const lines = body.split(/\r?\n/)
  const markers: { line: number; titulo: string }[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()
    if (!line) continue
    if (isPdfTableOfContentsLine(line)) continue
    if (CHAPTER_HEADING.test(line) || isChapterLikeTitle(line)) {
      markers.push({ line: i, titulo: normalizePortugueseChapterTitle(line) })
    }
  }

  if (markers.length === 0) {
    const mecCaps = parseMecCapitulos(body, textoOrigem)
    if (mecCaps.length >= 2) return mecCaps

    const paginas = applyPaginasSeNecessario(
      mecCaps.length === 1 ? mecCaps : [],
      textoMarcadores,
      textoOrigem,
    )
    if (paginas.length >= 2 || inferIntegralDivisaoModo(paginas) === 'paginas') {
      return paginas
    }
    if (mecCaps.length >= 1) {
      const up = applyPaginasSeNecessario(mecCaps, textoMarcadores, textoOrigem)
      if (up.length >= 2 || inferIntegralDivisaoModo(up) === 'paginas') return up
    }

    const diario = parseDiarioPorData(body, textoOrigem)
    if (diario.length >= 3) {
      return applyPaginasSeNecessario(diario, textoMarcadores, textoOrigem)
    }

    if (!hasIntegralPageMarkers(rawWithMarkers)) {
      const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim().length >= 200)
      if (capHeadingCount < 2 && paragraphs.length >= 3) {
        const partes = paragraphs.map((p, idx) => ({
          ordem: idx + 1,
          titulo: `Parte ${idx + 1}`,
          texto_pt: p.trim(),
          texto_origem: textoOrigem,
        }))
        return partes
      }
    }

    const unico = [
      {
        ordem: 1,
        titulo: 'Texto integral',
        texto_pt: stripNeadFromChunk(body),
        texto_origem: textoOrigem,
      },
    ]
    return applyPaginasSeNecessario(unico, textoMarcadores, textoOrigem)
  }

  const capitulos: CapituloParsed[] = []
  for (let m = 0; m < markers.length; m++) {
    const startLine = markers[m]!.line
    const endLine = m + 1 < markers.length ? markers[m + 1]!.line : lines.length
    const chunk = stripNeadFromChunk(lines.slice(startLine, endLine).join('\n').trim())
    if (chunk.length < 40) continue
    capitulos.push({
      ordem: capitulos.length + 1,
      titulo: markers[m]!.titulo,
      texto_pt: chunk,
      texto_origem: textoOrigem,
    })
  }

  const filtered = capitulos
    .filter((c) => c.texto_pt.length >= 40)
    .filter((c) => !capituloTituloPareceLixo(c.titulo))
  const expanded = expandCapitulosSeHeadingsEmbutidos(filtered)
  const finalized = finalizeCapitulosParsed(expanded)
  if (capitulosPortuguesReais(finalized)) return finalized
  return applyPaginasSeNecessario(finalized, textoMarcadores, textoOrigem)
}

const CERVANTES_CHAPTER_LINE =
  /(?:^|\n)\s*(?:#{1,2}\s*)?(Capítulo\s+(?:C\s+)?[IVXLCDM]+)\s*(?:\n|$)/gi;

/** HTML da Biblioteca Virtual Miguel de Cervantes (obra-visor …/html/). */
export function parseCervantesVirtualHtml(html: string, textoOrigem: string): CapituloParsed[] {
  const h2Re = /<h2[^>]*>\s*(Capítulo\s+[^<]+)\s*<\/h2>/gi;
  const h2matches = [...html.matchAll(h2Re)];
  if (h2matches.length >= 1) {
    const capitulos: CapituloParsed[] = [];
    for (let i = 0; i < h2matches.length; i++) {
      const titulo = stripHtml(h2matches[i]![1] ?? h2matches[i]![0] ?? "").trim();
      const start = h2matches[i]!.index ?? 0;
      const end = i + 1 < h2matches.length ? h2matches[i + 1]!.index ?? html.length : html.length;
      const chunk = stripHtml(html.slice(start, end)).trim();
      if (chunk.length < 40) continue;
      capitulos.push({
        ordem: capitulos.length + 1,
        titulo,
        texto_pt: chunk,
        texto_origem: textoOrigem,
      });
    }
    if (capitulos.length > 0) return capitulos;
  }

  const text = stripHtml(html).replace(/\r/g, "");
  const markers: { index: number; titulo: string }[] = [];
  for (const match of text.matchAll(CERVANTES_CHAPTER_LINE)) {
    const titulo = (match[1] ?? "Capítulo").trim();
    const index = match.index ?? 0;
    if (!markers.some((m) => m.index === index)) {
      markers.push({ index, titulo });
    }
  }
  if (markers.length === 0) return [];

  const capitulos: CapituloParsed[] = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i]!.index;
    const end = i + 1 < markers.length ? markers[i + 1]!.index : text.length;
    const chunk = text.slice(start, end).trim();
    if (chunk.length < 40) continue;
    capitulos.push({
      ordem: capitulos.length + 1,
      titulo: markers[i]!.titulo,
      texto_pt: chunk,
      texto_origem: textoOrigem,
    });
  }
  return capitulos;
}

export function isMislabeledPdfAsText(raw: string): boolean {
  const head = raw.slice(0, 8192).trimStart();
  if (head.startsWith("%PDF-")) return true;
  if (/^%PDF-1\.\d/m.test(head)) return true;
  if (head.includes("%PDF-1.") && /\\[0-9A-F]{2}/i.test(head.slice(0, 500))) return true;
  return false;
}

/** Conteúdo obtido por link (HTML ou .txt) — usado no navegador e na Edge Function. */
export function parseIntegralFromUrlContent(fonteUrl: string, raw: string): CapituloParsed[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  let host = ''
  try {
    host = new URL(fonteUrl).hostname.toLowerCase()
  } catch {
    host = ''
  }

  if (isGutenbergMaintenanceHtml(trimmed)) return []

  const isHtml =
    trimmed.startsWith('<') || /<html[\s>]/i.test(trimmed.slice(0, 4000)) || /<body[\s>]/i.test(trimmed)

  if (isHtml) {
    const origemHtml = host.includes('gutenberg')
      ? 'HTML — Project Gutenberg'
      : host
        ? `HTML importado de ${host}`
        : 'HTML importado'
    const generic = parseGutenbergStyleHtml(trimmed, origemHtml, fonteUrl)
    if (generic.length >= 1) return finalizeCapitulosParsed(generic)
    if (host.includes('gutenberg')) return []
  }

  if (host.includes('gutenberg.net.au') || fonteUrl.includes('gutenberg.net.au')) {
    const caps = parseGutenbergAuHtml(trimmed, 'HTML — Project Gutenberg Australia')
    if (caps.length > 0) return finalizeCapitulosParsed(caps)
  }

  if (host.includes('gutenberg.org') && !host.includes('gutenberg.net.au')) {
    const orgCaps = parseGutenbergOrgHtml(trimmed, 'HTML — Project Gutenberg', fonteUrl)
    if (orgCaps.length >= 1) return finalizeCapitulosParsed(orgCaps)
  }

  if (host.includes('cervantesvirtual') || /<Capítulo\s+/i.test(trimmed)) {
    const caps = parseCervantesVirtualHtml(
      trimmed,
      host.includes('cervantesvirtual') ? 'Biblioteca Virtual Miguel de Cervantes' : 'HTML importado',
    )
    if (caps.length > 0) return finalizeCapitulosParsed(caps)
  }

  let body = trimmed
  if (isHtml) {
    body = stripHtml(trimmed)
  }

  const origem = host ? `Importado de ${host}` : 'Link importado'
  return finalizeCapitulosParsed(parsePlainTextCapitulos(body, origem))
}

export function parseIntegralTextoBruto(
  textoBruto: string,
  fonteUrl: string,
  fallbackOrigem: string,
): CapituloParsed[] | null {
  const trimmed = textoBruto.trim();
  if (!trimmed) return null;
  if (isMislabeledPdfAsText(trimmed)) return null;

  if (/^https?:\/\//i.test(fonteUrl)) {
    const fromUrl = parseIntegralFromUrlContent(fonteUrl, trimmed);
    if (fromUrl.length > 0) return fromUrl;
  }

  const host = (() => {
    try {
      return new URL(fonteUrl).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  const isHtml =
    trimmed.startsWith("<") || /<html[\s>]/i.test(trimmed.slice(0, 2000)) || /<h2/i.test(trimmed);
  if (host.includes("cervantesvirtual") || (isHtml && trimmed.includes("Capítulo"))) {
    const caps = parseCervantesVirtualHtml(
      trimmed,
      host.includes("cervantesvirtual")
        ? "Biblioteca Virtual Miguel de Cervantes"
        : fallbackOrigem,
    );
    if (caps.length > 0) return finalizeCapitulosParsed(caps);
  }

  return finalizeCapitulosParsed(
    parsePlainTextCapitulos(
      trimmed,
      fonteUrl ? `Arquivo vinculado a ${fonteUrl}` : fallbackOrigem,
    ),
  );
}

export function decodeContentBuffer(buffer: ArrayBuffer, isLikelyHtml: boolean): string {
  if (!isLikelyHtml) {
    return new TextDecoder("utf-8").decode(buffer);
  }
  const latin1 = new TextDecoder("iso-8859-1").decode(buffer);
  if (!latin1.includes("\uFFFD") && /[éèêàâôûç]/i.test(latin1)) return latin1;
  return new TextDecoder("utf-8").decode(buffer);
}