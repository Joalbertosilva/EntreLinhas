import { MIN_OBRA_TEXTO_CHARS, obraIntegralTextoPareceCompleto } from '@tcc-sistema/integral-import'

/** Sites em que o HTML deve ser baixado no navegador (Cloudflare ou parsing no cliente). */
export function shouldFetchIntegralLinkInBrowser(fonteUrl: string): boolean {
  try {
    const host = new URL(fonteUrl).hostname.toLowerCase()
    if (host.includes('gutenberg.org') && !host.includes('gutenberg.net.au')) return false
    return (
      host.includes('cervantesvirtual') ||
      host.includes('gutenberg.net.au') ||
      host.includes('wikisource.org') ||
      host.includes('dominiopublico') ||
      host.includes('machado.mec.gov.br')
    )
  } catch {
    return false
  }
}

/**
 * Busca o HTML no navegador do professor (sessão / cookies do usuário).
 * Usado quando a Edge Function não passa pelo Cloudflare ou para unificar o parser.
 */
export async function fetchIntegralSourceInBrowser(fonteUrl: string): Promise<string> {
  const res = await fetch(fonteUrl, { credentials: 'omit', redirect: 'follow' })
  if (!res.ok) {
    throw new Error(`Não foi possível abrir o link no navegador (HTTP ${res.status}).`)
  }
  const html = await res.text()
  if (html.includes('Just a moment') && html.toLowerCase().includes('cloudflare')) {
    throw new Error(
      'O site pediu verificação (Cloudflare). Abra o mesmo link numa aba, conclua o desafio e tente Importar de novo.',
    )
  }
  if (!obraIntegralTextoPareceCompleto(html)) {
    throw new Error(
      `O link retornou só ${html.length} caracteres (mínimo ~${MIN_OBRA_TEXTO_CHARS}). Use a página .html da obra no gutenberg.net.au ou salve a página como arquivo .html.`,
    )
  }
  return html
}