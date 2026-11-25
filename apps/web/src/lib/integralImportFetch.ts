/** Sites cujo HTML deve ser baixado no navegador (Cloudflare bloqueia o servidor). */
export function shouldFetchIntegralLinkInBrowser(fonteUrl: string): boolean {
  try {
    const host = new URL(fonteUrl).hostname.toLowerCase()
    return host.includes('cervantesvirtual')
  } catch {
    return false
  }
}

/**
 * Busca o HTML no navegador do professor (sessão / cookies do usuário).
 * Usado para Biblioteca Cervantes quando a Edge Function não passa pelo Cloudflare.
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
  return html
}