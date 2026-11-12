import type { CategoriaObra } from '@tcc-sistema/types'
import {
  getCategoryCoverMotifs,
  type CoverMotifColorKey,
  type CoverMotifIcon,
} from './categoryMotifs'

import { COVER_ART_BASE_WIDTH } from './layout'

export { COVER_ART_BASE_HEIGHT, COVER_ART_BASE_WIDTH } from './layout'

export type CoverMotifPalette = Record<CoverMotifColorKey, string>

function resolveColor(palette: CoverMotifPalette, key: CoverMotifColorKey): string {
  return palette[key]
}

function drawOneMotif(
  ctx: CanvasRenderingContext2D,
  motif: CoverMotifIcon,
  palette: CoverMotifPalette,
  scale: number,
) {
  const vb = motif.viewBoxWidth ?? 24
  const color = resolveColor(palette, motif.colorKey)
  const alpha = motif.opacity ?? 0.68
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(motif.x * scale, motif.y * scale)
  if (motif.rotation) {
    ctx.rotate((motif.rotation * Math.PI) / 180)
  }
  const k = (motif.size * scale) / vb
  ctx.scale(k, k)
  ctx.translate(-vb / 2, -vb / 2)

  const path = new Path2D(motif.path)
  const lineW = (motif.strokeWidth ?? 2.1) / k

  if (motif.stroke) {
    ctx.strokeStyle = color
    ctx.lineWidth = lineW
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke(path)
  } else {
    ctx.fillStyle = color
    ctx.fill(path)
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha * 0.72
    ctx.lineWidth = Math.max(1.1, lineW * 0.55)
    ctx.stroke(path)
  }
  ctx.restore()
}

export function drawCategoryCoverMotifs(
  ctx: CanvasRenderingContext2D,
  categoria: CategoriaObra,
  palette: CoverMotifPalette,
  coverWidth = COVER_ART_BASE_WIDTH,
) {
  const scale = coverWidth / COVER_ART_BASE_WIDTH
  for (const motif of getCategoryCoverMotifs(categoria)) {
    drawOneMotif(ctx, motif, palette, scale)
  }
}
