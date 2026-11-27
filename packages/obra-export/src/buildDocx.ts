import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  PageBreak,
  Packer,
  Paragraph,
  TextRun,
  type ParagraphChild,
} from 'docx'
import { paragrafosAgradecimentoEntreLinhas } from './agradecimento'
import { capaDimensoesDocx } from './capaImagem'
import type { ObraExportSnapshot } from './snapshot'
import { textoParaParagrafosLeitura } from './snapshot'

function base64ToUint8Array(base64: string): Uint8Array {
  const g = globalThis as { atob?: (s: string) => string; Buffer?: { from(s: string, enc: string): Uint8Array } }
  if (typeof g.atob === 'function') {
    const bin = g.atob(base64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  }
  if (g.Buffer) return g.Buffer.from(base64, 'base64')
  throw new Error('Base64 indisponível')
}

function bodyParagraphs(texto: string, isPoema: boolean): Paragraph[] {
  const partes = textoParaParagrafosLeitura(texto)
  return partes.map((bloco) => {
    const lines = bloco.split('\n').map((l) => l.trim()).filter(Boolean)
    const children: ParagraphChild[] = []
    lines.forEach((line, idx) => {
      if (idx > 0) children.push(new TextRun({ break: 1 }))
      children.push(
        new TextRun({
          text: line,
          size: isPoema ? 24 : 22,
          italics: isPoema,
        }),
      )
    })
    return new Paragraph({
      children: children.length ? children : [new TextRun('')],
      spacing: { after: 240, line: isPoema ? 360 : 320 },
      alignment: isPoema ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    })
  })
}

function capaParagraphs(snapshot: ObraExportSnapshot): Paragraph[] {
  const out: Paragraph[] = []

  if (snapshot.capa) {
    const dim = capaDimensoesDocx(snapshot.capa)
    out.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 280 },
        children: [
          new ImageRun({
            data: base64ToUint8Array(snapshot.capa.base64),
            transformation: { width: dim.width, height: dim.height },
            type: snapshot.capa.mimeType.includes('png') ? 'png' : 'jpg',
          }),
        ],
      }),
    )
  }

  out.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: snapshot.capa ? 120 : 2400, after: 160 },
      children: [new TextRun({ text: snapshot.titulo, bold: true, size: 48 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: snapshot.autorNome, italics: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${snapshot.tipoLabel} · ${snapshot.categoriaLabel}`,
          size: 22,
          color: '444444',
        }),
      ],
    }),
  )

  if (snapshot.descricao) {
    out.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 120, after: 200 },
        children: [new TextRun({ text: snapshot.descricao, size: 22 })],
      }),
    )
  }

  out.push(new Paragraph({ children: [new PageBreak()] }))
  return out
}

function agradecimentosParagraphs(snapshot: ObraExportSnapshot): Paragraph[] {
  const out: Paragraph[] = [
    new Paragraph({
      text: 'Agradecimentos',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 280 },
    }),
  ]

  for (const p of paragrafosAgradecimentoEntreLinhas(snapshot.autorNome)) {
    out.push(
      new Paragraph({
        children: [new TextRun({ text: p, size: 22 })],
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      }),
    )
  }

  out.push(new Paragraph({ children: [new PageBreak()] }))
  return out
}

function mostrarTituloCapitulo(snapshot: ObraExportSnapshot, cap: { titulo: string }, index: number): boolean {
  if (snapshot.estruturarCapitulos) return true
  if (snapshot.capitulos.length > 1) return true
  if (cap.titulo && cap.titulo !== 'Texto') return true
  return index > 0
}

function capituloParagraphs(
  snapshot: ObraExportSnapshot,
  cap: { titulo: string; texto: string },
  index: number,
): Paragraph[] {
  const isPoema = snapshot.tipo === 'poema'
  const out: Paragraph[] = []
  if (index > 0) out.push(new Paragraph({ children: [new PageBreak()] }))

  if (mostrarTituloCapitulo(snapshot, cap, index)) {
    out.push(
      new Paragraph({
        text: cap.titulo,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 240 },
      }),
    )
  }

  out.push(...bodyParagraphs(cap.texto, isPoema))
  return out
}

export function buildObraDocxDocument(snapshot: ObraExportSnapshot): Document {
  const dataStr = snapshot.geradoEm.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

  const children: Paragraph[] = [
    ...capaParagraphs(snapshot),
    ...agradecimentosParagraphs(snapshot),
  ]

  snapshot.capitulos.forEach((cap, index) => {
    if (!cap.texto.trim() && snapshot.capitulos.length > 1) return
    children.push(...capituloParagraphs(snapshot, cap, index))
  })

  return new Document({
    creator: 'EntreLinhas',
    title: snapshot.titulo,
    description: snapshot.descricao ?? undefined,
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `EntreLinhas · exportado em ${dataStr}`,
                    size: 18,
                    color: '666666',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  })
}

export async function buildObraDocxBlob(snapshot: ObraExportSnapshot): Promise<Blob> {
  return Packer.toBlob(buildObraDocxDocument(snapshot))
}

export async function buildObraDocxBase64(snapshot: ObraExportSnapshot): Promise<string> {
  const doc = buildObraDocxDocument(snapshot)
  return Packer.toBase64String(doc)
}