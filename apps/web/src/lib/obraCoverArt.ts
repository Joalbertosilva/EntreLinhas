import type { CategoriaObra } from '@tcc-sistema/types'
import {
  COVER_ART_BASE_HEIGHT,
  COVER_ART_BASE_WIDTH,
  COVER_BRAND,
  COVER_FRAME,
  COVER_KICKER,
  COVER_PHOTO_RECT,
  COVER_TITLE_PANEL,
  COVER_TITLE_FONT_FAMILY,
  COVER_UI_FONT_FAMILY,
  coverTextOnGradient,
  coverTextOnLightPanel,
  drawCategoryCoverMotifs,
  type CoverMotifPalette,
} from '@tcc-sistema/cover-motifs'
import {
  CATEGORIA_COVER_PALETTE,
  CATEGORIA_OBRA_KICKER,
  CATEGORIA_OBRA_SUBTITLE,
} from '@/lib/obraCategoriaLabels'

const COVER_WIDTH = COVER_ART_BASE_WIDTH
const COVER_HEIGHT = COVER_ART_BASE_HEIGHT

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
  const pad = COVER_FRAME.pad
  const inset = COVER_FRAME.inset
  ctx.strokeStyle = palette.frame
  ctx.lineWidth = COVER_FRAME.outerBorder
  ctx.strokeRect(pad, pad, COVER_WIDTH - pad * 2, COVER_HEIGHT - pad * 2)

  ctx.strokeStyle = palette.accent
  ctx.globalAlpha = COVER_FRAME.innerOpacity
  ctx.lineWidth = COVER_FRAME.innerBorder
  ctx.strokeRect(pad + inset, pad + inset, COVER_WIDTH - (pad + inset) * 2, COVER_HEIGHT - (pad + inset) * 2)
  ctx.globalAlpha = 1

  const dot = COVER_FRAME.cornerInset
  const corners = [
    [pad + dot, pad + dot],
    [COVER_WIDTH - pad - dot, pad + dot],
    [pad + dot, COVER_HEIGHT - pad - dot],
    [COVER_WIDTH - pad - dot, COVER_HEIGHT - pad - dot],
  ] as const
  ctx.fillStyle = palette.frame
  for (const [cx, cy] of corners) {
    ctx.beginPath()
    ctx.arc(cx, cy, COVER_FRAME.cornerDot, 0, Math.PI * 2)
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
  const textGradient = coverTextOnGradient(palette)
  const textPanel = coverTextOnLightPanel(palette)

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

    drawDecorativeFrame(ctx, palette)

    const photoX = COVER_PHOTO_RECT.left
    const photoY = COVER_PHOTO_RECT.top
    const photoW = COVER_PHOTO_RECT.right - COVER_PHOTO_RECT.left
    const photoH = COVER_PHOTO_RECT.bottom - COVER_PHOTO_RECT.top
    drawRoundedPhoto(ctx, photo, photoX, photoY, photoW, photoH, 14)

    const motifPalette: CoverMotifPalette = {
      text: palette.text,
      frame: palette.frame,
      accent: palette.accent,
      bottom: palette.bottom,
      mid: palette.mid,
    }
    drawCategoryCoverMotifs(ctx, input.categoria, motifPalette, COVER_WIDTH)
    drawSoftGrain(ctx)

    ctx.textAlign = 'center'

    const tp = COVER_TITLE_PANEL
    const textPanelY = tp.top
    const textPanelH = tp.height

    ctx.font = `600 ${COVER_KICKER.fontSize}px ${COVER_UI_FONT_FAMILY}`
    ctx.fillStyle = textGradient
    ctx.globalAlpha = COVER_KICKER.opacity
    const kickerSpaced = kicker.split('').join('\u2009')
    ctx.fillText(kickerSpaced, COVER_WIDTH / 2, COVER_KICKER.y)
    ctx.globalAlpha = 1

    ctx.beginPath()
    ctx.moveTo(COVER_WIDTH / 2 - COVER_KICKER.ruleHalfWidth, COVER_KICKER.ruleY)
    ctx.lineTo(COVER_WIDTH / 2 + COVER_KICKER.ruleHalfWidth, COVER_KICKER.ruleY)
    ctx.strokeStyle = palette.frame
    ctx.lineWidth = COVER_KICKER.ruleHeight
    ctx.stroke()

    const panelGrad = ctx.createLinearGradient(0, textPanelY, 0, textPanelY + textPanelH)
    panelGrad.addColorStop(0, 'rgb(255 255 255 / 0)')
    panelGrad.addColorStop(0.25, 'rgb(255 255 255 / 0.72)')
    panelGrad.addColorStop(1, 'rgb(255 255 255 / 0.88)')
    ctx.fillStyle = panelGrad
    ctx.fillRect(tp.left, textPanelY, tp.width, textPanelH)

    ctx.fillStyle = textPanel
    ctx.font = `600 ${tp.titleFontSize}px ${COVER_TITLE_FONT_FAMILY}`
    wrapText(
      ctx,
      titulo,
      COVER_WIDTH / 2,
      textPanelY + tp.titleTopPad,
      COVER_ART_BASE_WIDTH - 100,
      tp.titleLineHeight,
    )

    const lineY = textPanelY + textPanelH * tp.dividerOffsetInPanel
    ctx.strokeStyle = palette.frame
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(COVER_WIDTH / 2 - tp.dividerHalfWidth, lineY)
    ctx.lineTo(COVER_WIDTH / 2 + tp.dividerHalfWidth, lineY)
    ctx.stroke()

    ctx.font = `italic ${tp.subtitleFontSize}px ${COVER_TITLE_FONT_FAMILY}`
    ctx.globalAlpha = 0.82
    ctx.fillStyle = textPanel
    ctx.fillText(subtitle, COVER_WIDTH / 2, textPanelY + textPanelH * tp.subtitleOffsetInPanel)

    ctx.font = `500 10px ${COVER_UI_FONT_FAMILY}`
    ctx.globalAlpha = 0.45
    ctx.fillStyle = textGradient
    ctx.fillText('EntreLinhas', COVER_WIDTH / 2, COVER_HEIGHT - COVER_BRAND.bottom)
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
