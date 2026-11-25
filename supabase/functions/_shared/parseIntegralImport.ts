import {
  cleanDominioPublicoPdfText,
  countMecCapituloHeadings,
  isDominioPublicoPdfLikeText,
  stripNeadFromChunk,
  tituloFromMecCapituloPart,
  trimMecPdfPreamble,
} from './cleanPdfText'

export {
  cleanDominioPublicoPdfText,
  countMecCapituloHeadings,
  isDominioPublicoPdfLikeText,
  stripNeadFromChunk,
  tituloFromMecCapituloPart,
  trimMecPdfPreamble,
} from './cleanPdfText'

export type CapituloParsed = {
  ordem: number;
  titulo: string;
  texto_pt: string;
  texto_origem: string | null;
};

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Obras HTML no Project Gutenberg Australia com âncoras ppchap / ppded. */
export function parseGutenbergAuHtml(html: string, textoOrigem: string): CapituloParsed[] {
  const anchorRe =
    /<a\s+name="(pp(?:ded|chap\d+))"\s+id="\1"><\/a>(?:\s*<hr\s*\/?>)?\s*<h2>([^<]*)<\/h2>/gi;
  const matches = [...html.matchAll(anchorRe)];
  if (matches.length === 0) return [];

  const capitulos: CapituloParsed[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!;
    const titulo = stripHtml(match[2] ?? match[1] ?? "").trim() || `Seção ${i + 1}`;
    const start = match.index ?? 0;
    const end = i + 1 < matches.length ? matches[i + 1]!.index ?? html.length : html.length;
    const texto = stripHtml(html.slice(start, end));
    if (texto.length < 40) continue;
    capitulos.push({
      ordem: 0,
      titulo,
      texto_pt: texto,
      texto_origem: textoOrigem,
    });
  }

  return capitulos
    .map((c, idx) => ({ ...c, ordem: idx + 1 }))
    .filter((c) => c.texto_pt.length >= 40);
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
  /^(?:(?:CHAPTER|CHAPITRE|Capítulo|CAPÍTULO|LIVRO|Livro|PREMIER|DEUXIÈME|TROISIÈME)\s+[IVXLCDM\d]+(?:\s*[.—–-]\s*.+)?|(?:CAPÍTULO|Capítulo)\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]+)(?:\s*\/\s*.+|\s+DO\s+.+|\s+[.—–-]\s*.+)?|(?:CHAPTER|CHAPITRE|Capítulo|CAPÍTULO)\s+[A-Za-zÀ-ÿ][^\n]{0,80})$/i;

const MEC_CAPITULO_SPLIT =
  /(?=\bCAP[ÍI]TULO\s+(?:PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO|NONO|D[EÉ]CIMO|[IVXLCDM]{1,7})\b)/i;

function parseMecCapitulos(body: string, textoOrigem: string): CapituloParsed[] {
  const parts = body
    .split(MEC_CAPITULO_SPLIT)
    .map((p) => trimMecPdfPreamble(p))
    .filter((p) => p.length >= 40);
  if (parts.length === 0) return [];
  return parts.map((part, idx) => ({
    ordem: idx + 1,
    titulo: tituloFromMecCapituloPart(part),
    texto_pt: stripNeadFromChunk(part),
    texto_origem: textoOrigem,
  }));
}

/** Texto plano (.txt) — capítulos por linhas-título (Gutenberg, Domínio Público exportado). */
export function parsePlainTextCapitulos(text: string, textoOrigem: string): CapituloParsed[] {
  let body = trimGutenbergWrapper(text);
  const mecStyle = isDominioPublicoPdfLikeText(body);
  if (mecStyle) {
    body = cleanDominioPublicoPdfText(body);
  }
  if (body.length < 80) return [];

  const capHeadingCount = countMecCapituloHeadings(body);
  if (mecStyle || capHeadingCount >= 2) {
    const mecCaps = parseMecCapitulos(body, textoOrigem);
    if (mecCaps.length >= 1) return mecCaps;
  }

  const lines = body.split(/\r?\n/);
  const markers: { line: number; titulo: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;
    if (CHAPTER_HEADING.test(line)) {
      markers.push({ line: i, titulo: line });
    }
  }

  if (markers.length === 0) {
    const mecCaps = parseMecCapitulos(body, textoOrigem);
    if (mecCaps.length >= 1) return mecCaps;

    const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim().length >= 200);
    if (capHeadingCount < 2 && paragraphs.length >= 3) {
      return paragraphs.map((p, idx) => ({
        ordem: idx + 1,
        titulo: `Parte ${idx + 1}`,
        texto_pt: p.trim(),
        texto_origem: textoOrigem,
      }));
    }
    return [
      {
        ordem: 1,
        titulo: "Texto integral",
        texto_pt: body,
        texto_origem: textoOrigem,
      },
    ];
  }

  const capitulos: CapituloParsed[] = [];
  for (let m = 0; m < markers.length; m++) {
    const startLine = markers[m]!.line;
    const endLine = m + 1 < markers.length ? markers[m + 1]!.line : lines.length;
    const chunk = stripNeadFromChunk(lines.slice(startLine, endLine).join("\n").trim());
    if (chunk.length < 40) continue;
    capitulos.push({
      ordem: capitulos.length + 1,
      titulo: markers[m]!.titulo,
      texto_pt: chunk,
      texto_origem: textoOrigem,
    });
  }

  return capitulos.filter((c) => c.texto_pt.length >= 40);
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

export function parseIntegralTextoBruto(
  textoBruto: string,
  fonteUrl: string,
  fallbackOrigem: string,
): CapituloParsed[] | null {
  const trimmed = textoBruto.trim();
  if (!trimmed) return null;
  if (isMislabeledPdfAsText(trimmed)) return null;

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
    if (caps.length > 0) return caps;
  }

  return parsePlainTextCapitulos(
    trimmed,
    fonteUrl ? `Arquivo vinculado a ${fonteUrl}` : fallbackOrigem,
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