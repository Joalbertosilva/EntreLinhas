import type { CapituloParsed } from "./parseIntegralImport.ts";

const CHUNK_CHARS = 3_200;
const TRANSLATE_ATTEMPTS = 4;
const BASE_PAUSE_MS = 350;
const MYMEMORY_MAX = 480;

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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function mapSl(source: string): string {
  if (source === "origem" || source === "desconhecido" || source === "auto") return "auto";
  return source;
}

/** Mesmo endpoint que google-translate-api-x (`client=at`) — o antigo `gtx` costuma devolver HTML/bloqueio. */
async function translateViaGoogleAt(text: string, source: string): Promise<string | null> {
  const sl = mapSl(source);
  const body = new URLSearchParams({ sl, tl: "pt", q: text });
  const url =
    "https://translate.google.com/translate_a/single?client=at&dt=t&dt=rm&dj=1";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent":
        "Mozilla/5.0 (compatible; EntreLinhas-Import/1.0; educational translation)",
    },
    body,
  });

  if (!res.ok) return null;
  const raw = await res.text();
  if (raw.startsWith("<") || raw.includes("Sorry")) return null;
  let json: { sentences?: Array<{ trans?: string }> };
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const merged = (json.sentences ?? [])
    .map((s) => s.trans ?? "")
    .join("")
    .trim();
  return merged.length > 0 ? merged : null;
}

async function translateViaLibreTranslate(text: string, source: string): Promise<string | null> {
  const apiKey = Deno.env.get("LIBRETRANSLATE_API_KEY")?.trim();
  if (!apiKey) return null;
  const base = (Deno.env.get("LIBRETRANSLATE_URL") ?? "https://libretranslate.com").replace(/\/$/, "");

  const res = await fetch(`${base}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: mapSl(source),
      target: "pt",
      format: "text",
      api_key: apiKey,
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { translatedText?: string };
  const out = json.translatedText?.trim() ?? "";
  return out.length > 0 ? out : null;
}

async function translateViaMyMemory(text: string, source: string): Promise<string | null> {
  const q = text.length > MYMEMORY_MAX ? text.slice(0, MYMEMORY_MAX) : text;
  const sl = mapSl(source) === "auto" ? "en" : mapSl(source);
  const email = Deno.env.get("MYMEMORY_EMAIL")?.trim();
  const params = new URLSearchParams({ q, langpair: `${sl}|pt` });
  if (email) params.set("de", email);

  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    responseData?: { translatedText?: string };
    quotaFinished?: boolean;
  };
  const out = json.responseData?.translatedText?.trim() ?? "";
  if (!out || out.includes("MYMEMORY WARNING") || json.quotaFinished) return null;
  return out;
}

async function tryProviders(
  text: string,
  source: string,
  providers: Array<(t: string, s: string) => Promise<string | null>>,
): Promise<string | null> {
  for (const provider of providers) {
    const out = await provider(text, source);
    if (out) return out;
  }
  return null;
}

const PROVIDERS = [
  translateViaGoogleAt,
  translateViaLibreTranslate,
  translateViaMyMemory,
] as const;

async function translateChunk(text: string, source: string): Promise<string> {
  for (let attempt = 0; attempt < TRANSLATE_ATTEMPTS; attempt++) {
    const providers =
      attempt === 0
        ? [translateViaGoogleAt]
        : attempt === 1
          ? [translateViaGoogleAt, translateViaLibreTranslate]
          : PROVIDERS;
    const out = await tryProviders(text, source, providers);
    if (out) return out;
    if (attempt < TRANSLATE_ATTEMPTS - 1) {
      await sleep(700 + attempt * 1_100);
    }
  }
  throw new Error(
    "Tradutor indisponível no momento. Aguarde um minuto e importe de novo com tradução marcada — capítulos já gravados em PT são mantidos.",
  );
}

async function translateLongText(text: string, source: string): Promise<string> {
  const lang = mapSl(source);
  const chunks = splitForTranslation(text);
  const parts: string[] = [];
  for (const chunk of chunks) {
    parts.push(await translateChunk(chunk, lang));
    await sleep(BASE_PAUSE_MS);
  }
  return parts.join("\n\n");
}

export async function translateIntegralTextToPt(
  text: string,
  sourceLang: string,
): Promise<string> {
  if (!text.trim()) return "";
  return translateLongText(text, sourceLang);
}

export async function translateCapitulosToPt(
  capitulos: CapituloParsed[],
  sourceLang: string,
): Promise<CapituloParsed[]> {
  const lang = mapSl(sourceLang);

  const results: CapituloParsed[] = [];
  for (const cap of capitulos) {
    const originalTexto = cap.texto_pt;
    const tituloPt = await translateLongText(cap.titulo, lang);
    const textoPt = await translateLongText(originalTexto, lang);
    results.push({
      ...cap,
      titulo: tituloPt,
      texto_pt: textoPt,
      texto_origem: originalTexto,
    });
  }
  return results;
}