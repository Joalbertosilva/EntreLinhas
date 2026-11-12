export const COVER_ART_BASE_WIDTH = 720
export const COVER_ART_BASE_HEIGHT = 1080

/** Moldura dupla (px na base 720×1080). */
export const COVER_FRAME = {
  pad: 36,
  inset: 8,
  outerBorder: 2.5,
  innerBorder: 1,
  innerOpacity: 0.35,
  cornerDot: 3,
  cornerInset: 4,
} as const

/** Bolha decorativa no gradiente. */
export const COVER_ACCENT_BLOB = {
  cxRatio: 0.78,
  cyRatio: 0.32,
  r: 140,
  opacity: 0.18,
} as const

export const COVER_GRADIENT_RADIAL = {
  focalX: 0.35,
  focalY: 0.2,
  endX: 0.5,
  endY: 0.85,
} as const

/** Foto do usuário — área principal da capa. */
export const COVER_PHOTO_RECT = {
  left: 44,
  right: 676,
  top: 78,
  bottom: 756,
} as const

export const COVER_PHOTO_STYLE = {
  borderRadius: 14,
  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.55)',
} as const

/** Painel claro: só título da obra + subtítulo da categoria (sem autora / sem label duplicado). */
export const COVER_TITLE_PANEL = {
  top: 768,
  height: 168,
  left: 48,
  width: COVER_ART_BASE_WIDTH - 96,
  titleTopPad: 22,
  titleFontSize: 34,
  titleLineHeight: 40,
  titlePadX: 44,
  dividerOffsetInPanel: 0.5,
  dividerHalfWidth: 48,
  subtitleOffsetInPanel: 0.66,
  subtitleFontSize: 18,
} as const

export const COVER_KICKER = {
  y: 74,
  fontSize: 13,
  letterSpacing: 2.5,
  opacity: 0.75,
  ruleY: 92,
  ruleHalfWidth: 28,
  ruleHeight: 1.5,
} as const

/** Marca discreta na capa exportada (prévia ao vivo omite para não poluir). */
export const COVER_BRAND = {
  bottom: 28,
  fontSize: 10,
  opacity: 0.4,
} as const

export const COVER_PHOTO_FRAC = {
  left: COVER_PHOTO_RECT.left / COVER_ART_BASE_WIDTH,
  top: COVER_PHOTO_RECT.top / COVER_ART_BASE_HEIGHT,
  width: (COVER_PHOTO_RECT.right - COVER_PHOTO_RECT.left) / COVER_ART_BASE_WIDTH,
  height: (COVER_PHOTO_RECT.bottom - COVER_PHOTO_RECT.top) / COVER_ART_BASE_HEIGHT,
} as const

export function scaledCoverPhotoRect(
  width: number,
  height = width * (COVER_ART_BASE_HEIGHT / COVER_ART_BASE_WIDTH),
) {
  const sx = width / COVER_ART_BASE_WIDTH
  const sy = height / COVER_ART_BASE_HEIGHT
  return {
    x: COVER_PHOTO_RECT.left * sx,
    y: COVER_PHOTO_RECT.top * sy,
    width: (COVER_PHOTO_RECT.right - COVER_PHOTO_RECT.left) * sx,
    height: (COVER_PHOTO_RECT.bottom - COVER_PHOTO_RECT.top) * sy,
  }
}

export interface ScaledCoverLayout {
  width: number
  height: number
  s: number
  photo: ReturnType<typeof scaledCoverPhotoRect>
  framePad: number
  frameInnerPad: number
  panel: {
    x: number
    y: number
    width: number
    height: number
    titleY: number
    titleFontSize: number
    titleLineHeight: number
    titlePadX: number
    dividerY: number
    dividerHalfWidth: number
    subtitleY: number
    subtitleFontSize: number
  }
  kicker: {
    y: number
    fontSize: number
    letterSpacing: number
    ruleY: number
    ruleHalfWidth: number
    ruleHeight: number
  }
  blob: { cx: number; cy: number; r: number }
  brandBottom: number
  brandFontSize: number
  photoRadius: number
  photoBorder: number
}

export function scaledCoverLayout(
  width: number,
  height = width * (COVER_ART_BASE_HEIGHT / COVER_ART_BASE_WIDTH),
): ScaledCoverLayout {
  const s = width / COVER_ART_BASE_WIDTH
  const sy = height / COVER_ART_BASE_HEIGHT
  const photo = scaledCoverPhotoRect(width, height)
  const p = COVER_TITLE_PANEL
  const panelY = p.top * sy
  const panelH = p.height * sy

  return {
    width,
    height,
    s,
    photo,
    framePad: COVER_FRAME.pad * s,
    frameInnerPad: (COVER_FRAME.pad + COVER_FRAME.inset) * s,
    panel: {
      x: p.left * s,
      y: panelY,
      width: p.width * s,
      height: panelH,
      titleY: panelY + p.titleTopPad * sy,
      titleFontSize: p.titleFontSize * s,
      titleLineHeight: p.titleLineHeight * s,
      titlePadX: p.titlePadX * s,
      dividerY: panelY + panelH * p.dividerOffsetInPanel,
      dividerHalfWidth: p.dividerHalfWidth * s,
      subtitleY: panelY + panelH * p.subtitleOffsetInPanel,
      subtitleFontSize: p.subtitleFontSize * s,
    },
    kicker: {
      y: COVER_KICKER.y * sy,
      fontSize: COVER_KICKER.fontSize * s,
      letterSpacing: COVER_KICKER.letterSpacing * s,
      ruleY: COVER_KICKER.ruleY * sy,
      ruleHalfWidth: COVER_KICKER.ruleHalfWidth * s,
      ruleHeight: COVER_KICKER.ruleHeight * s,
    },
    blob: {
      cx: width * COVER_ACCENT_BLOB.cxRatio,
      cy: height * COVER_ACCENT_BLOB.cyRatio,
      r: COVER_ACCENT_BLOB.r * s,
    },
    brandBottom: COVER_BRAND.bottom * sy,
    brandFontSize: COVER_BRAND.fontSize * s,
    photoRadius: COVER_PHOTO_STYLE.borderRadius * s,
    photoBorder: COVER_PHOTO_STYLE.borderWidth * s,
  }
}
