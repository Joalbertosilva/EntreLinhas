export { COVER_ART_BASE_WIDTH, COVER_ART_BASE_HEIGHT } from './coverLayout'

import { COVER_ART_BASE_HEIGHT, COVER_ART_BASE_WIDTH, COVER_PHOTO_RECT } from './coverLayout'

export {
  COVER_PHOTO_FRAC,
  COVER_PHOTO_RECT,
  scaledCoverPhotoRect,
} from './coverLayout'

const MARGIN = 12

/** Centro X na coluna esquerda (fora da foto). */
export function motifLeftX(size: number): number {
  return COVER_PHOTO_RECT.left - MARGIN - size / 2
}

/** Centro X na coluna direita (fora da foto). */
export function motifRightX(size: number): number {
  return COVER_PHOTO_RECT.right + MARGIN + size / 2
}

export function obraCoverPhotoCropRect(imageWidth: number, imageHeight: number) {
  const scaleX = imageWidth / COVER_ART_BASE_WIDTH
  const scaleY = imageHeight / COVER_ART_BASE_HEIGHT
  const width = COVER_PHOTO_RECT.right - COVER_PHOTO_RECT.left
  const height = COVER_PHOTO_RECT.bottom - COVER_PHOTO_RECT.top
  return {
    originX: Math.max(0, Math.round(COVER_PHOTO_RECT.left * scaleX)),
    originY: Math.max(0, Math.round(COVER_PHOTO_RECT.top * scaleY)),
    width: Math.min(imageWidth, Math.round(width * scaleX)),
    height: Math.min(imageHeight, Math.round(height * scaleY)),
  }
}

export const MOTIF_Y = {
  /** Acima da foto */
  top: 86,
  /** Faixa lateral superior */
  upper: 235,
  /** Centro lateral (altura da foto) */
  mid: 390,
  /** Faixa lateral inferior */
  lower: 575,
  /** Rodapé (fora do painel de título central) */
  footLeft: 968,
  footRight: 968,
} as const
