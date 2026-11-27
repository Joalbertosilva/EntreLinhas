import { paragrafosAgradecimentoEntreLinhas } from './agradecimento'
import { capaImagemDataUrl } from './capaImagem'
import type { ObraExportSnapshot } from './snapshot'
import { textoParaParagrafosLeitura } from './snapshot'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function mostrarTituloCapitulo(snapshot: ObraExportSnapshot, cap: { titulo: string }, index: number): boolean {
  if (snapshot.estruturarCapitulos) return true
  if (snapshot.capitulos.length > 1) return true
  if (cap.titulo && cap.titulo !== 'Texto') return true
  return index > 0
}

export function buildObraPrintHtml(snapshot: ObraExportSnapshot): string {
  const isPoema = snapshot.tipo === 'poema'
  const dataStr = snapshot.geradoEm.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

  const capaOk = snapshot.capa && snapshot.capa.base64.length < 1_200_000
  const capaImg = capaOk
    ? `<img src="${capaImagemDataUrl(snapshot.capa!)}" alt="" style="max-width:280px;height:auto;border-radius:12px;margin:0 auto 16px;display:block;" />`
    : ''

  const sinopse = snapshot.descricao
    ? `<p style="text-align:center;max-width:480px;margin:12px auto 0;font-size:14px;color:#444;">${escapeHtml(snapshot.descricao)}</p>`
    : ''

  const agradecimentos = paragrafosAgradecimentoEntreLinhas(snapshot.autorNome)
    .map((p) => `<p style="margin:0 0 12px;text-align:justify;line-height:1.45;font-size:14px;">${escapeHtml(p)}</p>`)
    .join('')

  const capitulosHtml = snapshot.capitulos
    .map((cap, index) => {
      if (!cap.texto.trim() && snapshot.capitulos.length > 1) return ''
      const titulo = mostrarTituloCapitulo(snapshot, cap, index)
        ? `<h2 style="font-size:18px;margin:0 0 16px;color:#1a3342;">${escapeHtml(cap.titulo)}</h2>`
        : ''
      const paragrafos = textoParaParagrafosLeitura(cap.texto)
        .map((bloco) => {
          const align = isPoema ? 'center' : 'justify'
          const style = isPoema
            ? `font-style:italic;text-align:${align};margin:0 0 14px;line-height:1.55;`
            : `text-align:${align};margin:0 0 12px;line-height:1.45;text-indent:1.2em;`
          return `<p style="${style}">${escapeHtml(bloco).replace(/\n/g, '<br/>')}</p>`
        })
        .join('')
      const breakClass = index > 0 ? ' chapter-break' : ''
      return `<section class="chapter${breakClass}">${titulo}${paragrafos}</section>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(snapshot.titulo)}</title>
  <style>
    @page { margin: 48px; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #1a3342; font-size: 15px; }
    .sheet { page-break-after: always; }
    .chapter-break { page-break-before: always; }
    .meta { font-size: 13px; color: #555; }
    .cover-title { text-align: center; font-size: 26px; font-weight: 700; margin: 8px 0 4px; }
    .cover-author { text-align: center; font-size: 17px; font-style: italic; margin: 0 0 8px; }
    .foot { margin-top: 24px; font-size: 11px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="sheet">
    ${capaImg}
    <h1 class="cover-title">${escapeHtml(snapshot.titulo)}</h1>
    <p class="cover-author">${escapeHtml(snapshot.autorNome)}</p>
    <p class="meta" style="text-align:center;">${escapeHtml(snapshot.tipoLabel)} · ${escapeHtml(snapshot.categoriaLabel)}</p>
    ${sinopse}
  </div>
  <div class="sheet">
    <h2 style="text-align:center;font-size:20px;margin:0 0 20px;">Agradecimentos</h2>
    ${agradecimentos}
  </div>
  ${capitulosHtml}
  <p class="foot">EntreLinhas · exportado em ${escapeHtml(dataStr)}</p>
</body>
</html>`
}