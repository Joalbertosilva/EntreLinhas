import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import { paragrafosAgradecimentoEntreLinhas } from './agradecimento'
import { uint8ArrayToBase64 } from './base64'
import { capaDimensoesPdf, capaImagemDataUrl } from './capaImagem'
import type { ObraExportSnapshot } from './snapshot'
import { textoParaParagrafosLeitura } from './snapshot'

// @ts-expect-error vfs typings
pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts.vfs

function pageBreakAfter(): Content {
  return { text: '', pageBreak: 'after' }
}

function pageBreakBefore(): Content {
  return { text: '', pageBreak: 'before' }
}

function bodyContent(texto: string, isPoema: boolean): Content[] {
  const partes = textoParaParagrafosLeitura(texto)
  return partes.map((bloco) => ({
    text: bloco,
    style: isPoema ? 'poema' : 'corpo',
    margin: [0, 0, 0, 10] as [number, number, number, number],
  }))
}

function capaContent(snapshot: ObraExportSnapshot): Content[] {
  const linhas: Content[] = []

  if (snapshot.capa) {
    const dim = capaDimensoesPdf(snapshot.capa)
    linhas.push({
      image: capaImagemDataUrl(snapshot.capa),
      width: dim.width,
      height: dim.height,
      alignment: 'center',
      margin: [0, 40, 0, 24] as [number, number, number, number],
    })
  }

  linhas.push(
    { text: snapshot.titulo, style: 'capaTitulo', alignment: 'center', margin: [0, snapshot.capa ? 12 : 180, 0, 8] },
    { text: snapshot.autorNome, style: 'capaAutor', alignment: 'center', margin: [0, 0, 0, 6] },
    {
      text: `${snapshot.tipoLabel} · ${snapshot.categoriaLabel}`,
      style: 'meta',
      alignment: 'center',
      margin: [0, 0, 0, 16],
    },
  )

  if (snapshot.descricao) {
    linhas.push({
      text: snapshot.descricao,
      style: 'sinopseCapa',
      alignment: 'center',
      margin: [24, 8, 24, 0],
    })
  }

  linhas.push(pageBreakAfter())
  return linhas
}

function agradecimentosContent(snapshot: ObraExportSnapshot): Content[] {
  const blocos: Content[] = [{ text: 'Agradecimentos', style: 'subtitulo', alignment: 'center', margin: [0, 24, 0, 20] }]
  for (const p of paragrafosAgradecimentoEntreLinhas(snapshot.autorNome)) {
    blocos.push({
      text: p,
      style: 'corpo',
      margin: [0, 0, 0, 12],
    })
  }
  blocos.push(pageBreakAfter())
  return blocos
}

function mostrarTituloCapitulo(snapshot: ObraExportSnapshot, cap: { titulo: string }, index: number): boolean {
  if (snapshot.estruturarCapitulos) return true
  if (snapshot.capitulos.length > 1) return true
  if (cap.titulo && cap.titulo !== 'Texto') return true
  return index > 0
}

export function buildObraPdfBlob(snapshot: ObraExportSnapshot): Promise<Blob> {
  const isPoema = snapshot.tipo === 'poema'
  const dataStr = snapshot.geradoEm.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

  const content: Content[] = [...capaContent(snapshot), ...agradecimentosContent(snapshot)]

  snapshot.capitulos.forEach((cap, index) => {
    if (!cap.texto.trim() && snapshot.capitulos.length > 1) return

    if (index > 0) content.push(pageBreakBefore())
    if (mostrarTituloCapitulo(snapshot, cap, index)) {
      content.push({ text: cap.titulo, style: 'capitulo', margin: [0, 8, 0, 14] })
    }
    content.push(...bodyContent(cap.texto, isPoema))
  })

  const doc: TDocumentDefinitions = {
    info: {
      title: snapshot.titulo,
      author: snapshot.autorNome,
      creator: 'EntreLinhas',
    },
    content,
    styles: {
      capaTitulo: { fontSize: 22, bold: true },
      capaAutor: { fontSize: 14, italics: true, color: '#333333' },
      sinopseCapa: { fontSize: 10, lineHeight: 1.35, color: '#444444' },
      titulo: { fontSize: 20, bold: true, margin: [0, 0, 0, 12] },
      subtitulo: { fontSize: 14, bold: true, margin: [0, 14, 0, 6] },
      capitulo: { fontSize: 16, bold: true, margin: [0, 18, 0, 8] },
      meta: { fontSize: 10, color: '#444444' },
      corpo: { fontSize: 11, lineHeight: 1.35, alignment: 'justify' },
      poema: { fontSize: 12, italics: true, lineHeight: 1.5, alignment: 'center' },
      rodape: { fontSize: 8, color: '#666666', alignment: 'center' },
    },
    defaultStyle: { font: 'Roboto' },
    footer: (currentPage, pageCount) => ({
      margin: [40, 0, 40, 24],
      columns: [
        { text: `EntreLinhas · ${dataStr}`, style: 'rodape', alignment: 'left' },
        { text: `${currentPage} / ${pageCount}`, style: 'rodape', alignment: 'right' },
      ],
    }),
    pageMargins: [56, 56, 56, 56],
  }

  return new Promise((resolve, reject) => {
    try {
      const pdf = pdfMake.createPdf(doc)
      pdf.getBlob((blob) => resolve(blob))
    } catch (err) {
      reject(err)
    }
  })
}

export async function buildObraPdfBase64(snapshot: ObraExportSnapshot): Promise<string> {
  const blob = await buildObraPdfBlob(snapshot)
  const buf = await blob.arrayBuffer()
  return uint8ArrayToBase64(new Uint8Array(buf))
}