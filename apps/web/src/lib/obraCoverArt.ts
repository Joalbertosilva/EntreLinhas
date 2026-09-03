import type { CategoriaObra } from '@tcc-sistema/types'
import {
  CATEGORIA_COVER_PALETTE,
  CATEGORIA_OBRA_KICKER,
  CATEGORIA_OBRA_SUBTITLE,
} from '@/lib/obraCategoriaLabels'

const COVER_WIDTH = 720
const COVER_HEIGHT = 1080

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Não foi possível carregar a foto'))
    img.src = src
  })
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/)
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i]!
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = words[i]!
      currentY += lineHeight
    } else {
      line = test
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }
  return currentY
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rotation: number,
  color: string,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(18, -8, 36, -4, 42, 12)
  ctx.bezierCurveTo(28, 8, 12, 14, 0, 28)
  ctx.bezierCurveTo(-12, 14, -28, 8, -42, 12)
  ctx.bezierCurveTo(-36, -4, -18, -8, 0, 0)
  ctx.fill()
  ctx.strokeStyle = 'rgb(255 255 255 / 0.15)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

function drawSoftGrain(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.globalAlpha = 0.04
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * COVER_WIDTH
    const y = Math.random() * COVER_HEIGHT
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.restore()
}

function drawDecorativeFrame(ctx: CanvasRenderingContext2D, palette: { frame: string; accent: string }) {
  const pad = 36
  ctx.strokeStyle = palette.frame
  ctx.lineWidth = 2.5
  ctx.strokeRect(pad, pad, COVER_WIDTH - pad * 2, COVER_HEIGHT - pad * 2)

  ctx.strokeStyle = palette.accent
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 1
  ctx.strokeRect(pad + 8, pad + 8, COVER_WIDTH - (pad + 8) * 2, COVER_HEIGHT - (pad + 8) * 2)
  ctx.globalAlpha = 1

  const corners = [
    [pad + 4, pad + 4],
    [COVER_WIDTH - pad - 4, pad + 4],
    [pad + 4, COVER_HEIGHT - pad - 4],
    [COVER_WIDTH - pad - 4, COVER_HEIGHT - pad - 4],
  ] as const
  ctx.fillStyle = palette.frame
  for (const [cx, cy] of corners) {
    ctx.beginPath()
    ctx.arc(cx, cy, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawRoundedPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.clip()

  const scale = Math.max(w / photo.width, h / photo.height)
  const sw = photo.width * scale
  const sh = photo.height * scale
  ctx.drawImage(photo, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh)

  const overlay = ctx.createLinearGradient(x, y, x, y + h)
  overlay.addColorStop(0, 'rgb(0 0 0 / 0.08)')
  overlay.addColorStop(0.4, 'rgb(0 0 0 / 0)')
  overlay.addColorStop(1, 'rgb(0 0 0 / 0.28)')
  ctx.fillStyle = overlay
  ctx.fillRect(x, y, w, h)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgb(255 255 255 / 0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export interface ObraCoverArtInput {
  photoFile: File
  categoria: CategoriaObra
  titulo: string
  autorNome?: string
}

/** Gera capa conceitual editorial com foto, moldura e tipografia. */
export async function generateObraCoverArt(input: ObraCoverArtInput): Promise<Blob> {
  const palette = CATEGORIA_COVER_PALETTE[input.categoria]
  const kicker = CATEGORIA_OBRA_KICKER[input.categoria]
  const subtitle = CATEGORIA_OBRA_SUBTITLE[input.categoria]
  const titulo = input.titulo.trim() || 'Minha obra'

  const objectUrl = URL.createObjectURL(input.photoFile)
  try {
    const photo = await loadImage(objectUrl)
    const canvas = document.createElement('canvas')
    canvas.width = COVER_WIDTH
    canvas.height = COVER_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas indisponível')

    const bg = ctx.createRadialGradient(
      COVER_WIDTH * 0.35,
      COVER_HEIGHT * 0.2,
      80,
      COVER_WIDTH * 0.5,
      COVER_HEIGHT * 0.45,
      COVER_HEIGHT * 0.85,
    )
    bg.addColorStop(0, palette.top)
    bg.addColorStop(0.55, palette.mid)
    bg.addColorStop(1, palette.bottom)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT)

    ctx.save()
    ctx.globalAlpha = 0.18
    ctx.fillStyle = palette.accent
    ctx.beginPath()
    ctx.arc(COVER_WIDTH * 0.78, COVER_HEIGHT * 0.32, 140, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    drawLeaf(ctx, 56, COVER_HEIGHT - 120, 1.1, -0.4, palette.bottom)
    drawLeaf(ctx, COVER_WIDTH - 70, 140, 0.9, 2.2, palette.mid)
    drawLeaf(ctx, 48, 180, 0.75, 0.6, palette.accent)
    drawLeaf(ctx, COVER_WIDTH - 52, COVER_HEIGHT - 100, 1, -2.4, palette.bottom)

    drawSoftGrain(ctx)
    drawDecorativeFrame(ctx, palette)

    const photoW = COVER_WIDTH * 0.72
    const photoH = COVER_HEIGHT * 0.48
    const photoX = (COVER_WIDTH - photoW) / 2
    const photoY = COVER_HEIGHT * 0.12
    drawRoundedPhoto(ctx, photo, photoX, photoY, photoW, photoH, 14)

    ctx.textAlign = 'center'

    ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif'
    ctx.fillStyle = palette.text
    ctx.globalAlpha = 0.75
    const kickerSpaced = kicker.split('').join('\u2009')
    ctx.fillText(kickerSpaced, COVER_WIDTH / 2, 78)
    ctx.globalAlpha = 1

    ctx.beginPath()
    ctx.moveTo(COVER_WIDTH / 2 - 28, 92)
    ctx.lineTo(COVER_WIDTH / 2 + 28, 92)
    ctx.strokeStyle = palette.frame
    ctx.lineWidth = 1.5
    ctx.stroke()

    const textPanelY = COVER_HEIGHT * 0.68
    const textPanelH = COVER_HEIGHT * 0.26
    const panelGrad = ctx.createLinearGradient(0, textPanelY, 0, textPanelY + textPanelH)
    panelGrad.addColorStop(0, 'rgb(255 255 255 / 0)')
    panelGrad.addColorStop(0.25, 'rgb(255 255 255 / 0.72)')
    panelGrad.addColorStop(1, 'rgb(255 255 255 / 0.88)')
    ctx.fillStyle = panelGrad
    ctx.fillRect(48, textPanelY, COVER_WIDTH - 96, textPanelH)

    ctx.fillStyle = palette.text
    ctx.font = '600 32px Georgia, "Times New Roman", serif'
    const titleEndY = wrapText(ctx, titulo, COVER_WIDTH / 2, textPanelY + 44, COVER_WIDTH - 100, 38)

    const lineY = titleEndY + 14
    ctx.strokeStyle = palette.frame
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(COVER_WIDTH / 2 - 50, lineY)
    ctx.lineTo(COVER_WIDTH / 2 + 50, lineY)
    ctx.stroke()

    ctx.font = 'italic 17px Georgia, "Times New Roman", serif'
    ctx.globalAlpha = 0.82
    ctx.fillText(subtitle, COVER_WIDTH / 2, lineY + 30)
    ctx.globalAlpha = 1

    if (input.autorNome?.trim()) {
      ctx.font = '500 14px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.globalAlpha = 0.65
      ctx.fillText(input.autorNome.trim(), COVER_WIDTH / 2, COVER_HEIGHT - 52)
      ctx.globalAlpha = 1
    }

    ctx.font = '500 10px "Plus Jakarta Sans", system-ui, sans-serif'
    ctx.globalAlpha = 0.45
    ctx.fillText('EntreLinhas', COVER_WIDTH / 2, COVER_HEIGHT - 32)
    ctx.globalAlpha = 1

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem'))),
        'image/jpeg',
        0.94,
      )
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function generateObraCoverFile(input: ObraCoverArtInput): Promise<File> {
  const blob = await generateObraCoverArt(input)
  return new File([blob], 'capa-conceitual.jpg', { type: 'image/jpeg' })
}
