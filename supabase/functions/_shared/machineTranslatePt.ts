import type { CapituloParsed } from "./parseIntegralImport.ts";

const CHUNK_CHARS = 1_800;

function splitForTranslation(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= CHUNK_CHARS) return [trimmed];

  const parts: string[] = [];
  const paragraphs = trimmed.split(/\n\s*\n/);
  let buf = "";

  for (const p of paragraphs) {
    const next = buf ? `${buf}\n\n${p}` : p;
    if (next.length > CHUNK_CHARS && buf) {
      parts.push(buf);
      buf = p;
    } else if (next.length > CHUNK_CHARS) {
      for (let i = 0; i < p.length; i += CHUNK_CHARS) {
        parts.push(p.slice(i, i + CHUNK_CHARS));
      }
      buf = "";
    } else {
      buf = next;
    }
  }
  if (buf) parts.push(buf);
  return parts.filter((s) => s.length > 0);
}

function mapLangPair(source: string): string {
  if (source === "fr" || source === "auto") return "fr|pt-BR";
  if (source === "en") return "en|pt-BR";
  if (source === "es") return "es|pt-BR";
  return "fr|pt-BR";
}

async function translateViaLibreTranslate(text: string, source: string): Promise<string | null> {
  const baseUrl = (Deno.env.get("LIBRETRANSLATE_URL") ?? "https://libretranslate.com").replace(/\/$/, "");
  const apiKey = Deno.env.get("LIBRETRANSLATE_API_KEY");

  const payload: Record<string, string> = {
    q: text,
    source: source === "origem" || source === "desconhecido" ? "auto" : source,
    target: "pt",
    format: "text",
  };
  if (apiKey) payload.api_key = apiKey;

  const res = await fetch(`${baseUrl}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { translatedText?: string; error?: string };
  if (json.error || !json.translatedText) return null;
  return json.translatedText.trim();
}

/** Mesmo tipo de endpoint que o Chrome usa em “Traduzir para português” (uso só na importação, 1× por obra). */
async function translateViaGoogleGtx(text: string, source: string): Promise<string | null> {
  const sl = source === "origem" || source === "desconhecido" ? "auto" : source;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", sl);
  url.searchParams.set("tl", "pt");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const json = (await res.json()) as unknown;
  if (!Array.isArray(json) || !Array.isArray(json[0])) return null;
  const segments = json[0] as Array<[string, ...unknown[]]>;
  const merged = segments.map((row) => row[0]).filter(Boolean).join("");
  return merged.trim().length > 0 ? merged.trim() : null;
}

async function translateViaMyMemory(text: string, source: string): Promise<string | null> {
  const langpair = mapLangPair(source);
  const email = Deno.env.get("MYMEMORY_EMAIL");
  const params = new URLSearchParams({
    q: text,
    langpair,
  });
  if (email) params.set("de", email);

  const res = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    responseStatus?: number;
    quotaFinished?: boolean;
    responseData?: { translatedText?: string };
  };
  if (json.quotaFinished || json.responseStatus !== 200) return null;
  const out = json.responseData?.translatedText?.trim();
  return out && out.length > 0 ? out : null;
}

async function translateChunk(text: string, source: string): Promise<string> {
  const libre = await translateViaLibreTranslate(text, source);
  if (libre) return libre;

  const gtx = await translateViaGoogleGtx(text, source);
  if (gtx) return gtx;

  const memory = await translateViaMyMemory(text, source);
  if (memory) return memory;

  throw new Error(
    "Não foi possível traduzir automaticamente. Tente de novo em alguns minutos ou desmarque a tradução e importe no idioma original.",
  );
}

async function translateLongText(text: string, source: string): Promise<string> {
  const chunks = splitForTranslation(text);
  const parts: string[] = [];
  for (const chunk of chunks) {
    parts.push(await translateChunk(chunk, source));
    await new Promise((r) => setTimeout(r, 120));
  }
  return parts.join("\n\n");
}

const CHAPTER_CONCURRENCY = 1;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!, i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

export async function translateCapitulosToPt(
  capitulos: CapituloParsed[],
  sourceLang: string,
): Promise<CapituloParsed[]> {
  const lang =
    sourceLang === "desconhecido" || sourceLang === "origem" ? "auto" : sourceLang;

  return mapWithConcurrency(capitulos, CHAPTER_CONCURRENCY, async (cap) => {
    const originalTexto = cap.texto_pt;
    const [tituloPt, textoPt] = await Promise.all([
      translateLongText(cap.titulo, lang),
      translateLongText(originalTexto, lang),
    ]);

    return {
      ...cap,
      titulo: tituloPt,
      texto_pt: textoPt,
      texto_origem: originalTexto,
    };
  });
}