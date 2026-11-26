import { isGutenbergMaintenanceHtml, resolveGutenbergOrgReadingUrls } from './gutenbergHtml.ts'

export const MIN_OBRA_TEXTO_CHARS = 5_000

export function integralLinkDownloadCandidates(fonteUrl: string): string[] {
  const trimmed = fonteUrl.trim()
  const out: string[] = [trimmed]
  try {
    const host = new URL(trimmed).hostname.toLowerCase()
    if (host.includes('gutenberg.org') && !host.includes('gutenberg.net.au')) {
      out.push(...resolveGutenbergOrgReadingUrls(trimmed))
    }
  } catch {
    /* noop */
  }
  return [...new Set(out.filter(Boolean))]
}

export function obraIntegralTextoPareceCompleto(raw: string): boolean {
  const text = raw.trim()
  if (text.length < MIN_OBRA_TEXTO_CHARS) return false
  if (isGutenbergMaintenanceHtml(text)) return false
  if (/<html[\s>]/i.test(text) || /<h2[\s>]/i.test(text) || /ppchap\d+/i.test(text)) {
    return text.length >= MIN_OBRA_TEXTO_CHARS
  }
  return text.length >= 1_500
}