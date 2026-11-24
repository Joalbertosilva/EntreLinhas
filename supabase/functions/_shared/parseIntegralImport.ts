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
  /^(?:(?:CHAPTER|CHAPITRE|Capítulo|CAPÍTULO|LIVRO|Livro|PREMIER|DEUXIÈME|TROISIÈME)\s+[IVXLCDM\d]+(?:\s*[.—–-]\s*.+)?|(?:CHAPTER|CHAPITRE|Capítulo|CAPÍTULO)\s+[A-Za-zÀ-ÿ][^\n]{0,80})$/i;

/** Texto plano (.txt) — capítulos por linhas-título (Gutenberg, Domínio Público exportado). */
export function parsePlainTextCapitulos(text: string, textoOrigem: string): CapituloParsed[] {
  const body = trimGutenbergWrapper(text);
  if (body.length < 80) return [];

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
    const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim().length >= 200);
    if (paragraphs.length >= 3) {
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
    const chunk = lines.slice(startLine, endLine).join("\n").trim();
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

export function decodeContentBuffer(buffer: ArrayBuffer, isLikelyHtml: boolean): string {
  if (!isLikelyHtml) {
    return new TextDecoder("utf-8").decode(buffer);
  }
  const latin1 = new TextDecoder("iso-8859-1").decode(buffer);
  if (!latin1.includes("\uFFFD") && /[éèêàâôûç]/i.test(latin1)) return latin1;
  return new TextDecoder("utf-8").decode(buffer);
}