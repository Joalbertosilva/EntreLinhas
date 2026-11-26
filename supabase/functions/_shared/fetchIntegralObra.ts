import {
  decodeContentBuffer,
  isGutenbergMaintenanceHtml,
  resolveGutenbergOrgReadingUrls,
} from "./parseIntegralImport.ts";

const ALLOWED_HOSTS = [
  "gutenberg.net.au",
  "www.gutenberg.net.au",
  "gutenberg.org",
  "www.gutenberg.org",
  "dominiopublico.gov.br",
  "www.dominiopublico.gov.br",
  "dominiopublico.mec.gov.br",
  "machado.mec.gov.br",
  "wikisource.org",
  "pt.wikisource.org",
  "it.wikisource.org",
  "archive.org",
  "www.archive.org",
  "cervantesvirtual.com",
  "www.cervantesvirtual.com",
];

export const MIN_OBRA_TEXTO_CHARS = 5_000;

export function isAllowedIntegralUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return null;
    return url;
  } catch {
    return null;
  }
}

function isPlainTextUrl(url: URL): boolean {
  const path = url.pathname.toLowerCase();
  return path.endsWith(".txt") || path.endsWith(".txt.utf-8");
}

function isPdfUrl(url: URL): boolean {
  return url.pathname.toLowerCase().endsWith(".pdf");
}

function obraTextoPareceCompleto(raw: string): boolean {
  if (raw.length < MIN_OBRA_TEXTO_CHARS) return false;
  if (isGutenbergMaintenanceHtml(raw)) return false;
  if (/<html[\s>]/i.test(raw) || /<h2[\s>]/i.test(raw) || /ppchap\d+/i.test(raw)) {
    return raw.length >= MIN_OBRA_TEXTO_CHARS;
  }
  return raw.length >= 1_500;
}

/** Candidatos de URL (link colado + mirrors Gutenberg US). */
export function integralLinkDownloadCandidates(fonteUrl: string): string[] {
  const trimmed = fonteUrl.trim();
  const out: string[] = [trimmed];
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    if (host.includes("gutenberg.org") && !host.includes("gutenberg.net.au")) {
      out.push(...resolveGutenbergOrgReadingUrls(trimmed));
    }
  } catch {
    /* noop */
  }
  return [...new Set(out.filter(Boolean))];
}

export async function baixarObraIntegralRaw(
  fonteUrl: string,
): Promise<{ texto: string; fonte_url_efetiva: string }> {
  const url = isAllowedIntegralUrl(fonteUrl);
  if (!url) {
    throw new Error(
      "URL não permitida. Use gutenberg.net.au (página .html da obra), Cervantes, MEC, wikisource ou archive.org.",
    );
  }
  if (isPdfUrl(url)) {
    throw new Error("Link de PDF: use Enviar arquivo no formulário.");
  }

  const candidates = integralLinkDownloadCandidates(url.toString());
  let lastHttpError: string | null = null;
  let bestText = "";
  let bestUrl = fonteUrl;

  for (const tryUrl of candidates) {
    const tryParsed = new URL(tryUrl);
    let res: Response;
    try {
      res = await fetch(tryParsed.toString(), {
        headers: { "User-Agent": "EntreLinhas-Import/1.0 (educational; tcc-sistema)" },
      });
    } catch {
      lastHttpError = "falha de rede";
      continue;
    }

    if (!res.ok) {
      lastHttpError = `HTTP ${res.status}`;
      continue;
    }

    const buffer = await res.arrayBuffer();
    const asText = isPlainTextUrl(tryParsed);
    const raw = decodeContentBuffer(buffer, !asText);

    if (raw.includes("Just a moment") && raw.includes("cloudflare")) {
      lastHttpError = "bloqueio Cloudflare";
      continue;
    }
    if (isGutenbergMaintenanceHtml(raw)) {
      lastHttpError = "Project Gutenberg (gutenberg.org) em manutenção";
      continue;
    }
    if (raw.length > bestText.length) {
      bestText = raw;
      bestUrl = tryUrl;
    }
    if (obraTextoPareceCompleto(raw)) {
      return { texto: raw, fonte_url_efetiva: tryUrl };
    }
  }

  if (obraTextoPareceCompleto(bestText)) {
    return { texto: bestText, fonte_url_efetiva: bestUrl };
  }

  const dicaAu =
    " Prefira o link .html do gutenberg.net.au (página da obra, não a vitrine) ou salve a página como .html e use Enviar arquivo.";
  throw new Error(
    (lastHttpError
      ? `Não foi possível baixar a obra (${lastHttpError}).`
      : "O link trouxe pouco texto ou página de vitrine.") + dicaAu,
  );
}