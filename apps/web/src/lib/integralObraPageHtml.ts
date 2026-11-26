import { splitObraEmParagrafos } from '@/lib/integralObraParagraphs'

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function montarHtmlParagrafosObra(corpo: string): string {
  return splitObraEmParagrafos(corpo)
    .map((p) => `<p class="integral-obra-paragrafo">${escapeHtml(p)}</p>`)
    .join('')
}