import type { CategoriaObra } from '@tcc-sistema/types'
import { MOTIF_Y, motifLeftX, motifRightX } from './layout'

/** Coordenadas no espaço 720×1080 (capa base). viewBox padrão 24×24 salvo viewBoxWidth. */
export type CoverMotifColorKey = 'text' | 'frame' | 'accent' | 'bottom' | 'mid'

export interface CoverMotifIcon {
  path: string
  x: number
  y: number
  size: number
  viewBoxWidth?: number
  rotation?: number
  opacity?: number
  colorKey: CoverMotifColorKey
  stroke?: boolean
  strokeWidth?: number
}

const HEART =
  'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l9 9Z'

const COUPLE_EMBRACE =
  'M17 11m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M31 11m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M11 19c3-5 9-7 14-5s9 2 11-2c-1 7-8 15-16 15S9 26 11 19z'

const BOOK_OPEN = 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20'
const BOOK_CLOSED =
  'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2'

const FEATHER =
  'M12 2c2 4 2 8 0 12-3 6-8 8-8 8s2-6 6-9c2-2 4-3 6-3-2-4-4-6-4-8z'

const SPARKLE =
  'M12 2l1.8 5.5L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.5L12 2z'

const MOON = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'

const MOUNTAIN = 'M3 20 L9 9 L14 15 L18 8 L21 20 Z'

const COMPASS =
  'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-4.5l3.5-7-7 3.5 7 3.5-3.5-7z'

const MAGNIFIER =
  'M11 19a8 8 0 1 1 5.3-14.1M21 21l-4.3-4.3M15 11h-2v4h-1V9h3v2'

const CALENDAR =
  'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'

const CLOCK =
  'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-12v6l4 2'

const LIGHTBULB =
  'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z'

const GLASSES = 'M2 12h2a4 4 0 0 0 8 0h4a4 4 0 0 0 8 0h2'

const CASTLE = 'M4 20V10l4-4 4 2 4-2 4 4v10H4zm4-8h2v4H8zm8 0h2v4h-2z'

const WAND = 'M15 4l5 5M9 20l-4-4M3 21l6-6M14 5l5 5-11 11-5-5 11-11z'

const SCROLL =
  'M8 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4h10M8 12h7'

const USER = 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'

const TREE = 'M12 3c-2 4-1 7 2 9-4 1-6 5-5 8h10c1-3-1-7-5-8 3-2 4-5 2-9-1 2-2 3-4 3s-3-1-4-3z'

const HOURGLASS = 'M6 3h12v3l-4 5 4 5v3H6v-3l4-5-4-5V3zm6 8a2 2 0 0 0 0 4'

const PEN = 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'

const FINGERPRINT =
  'M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-4 8a6 6 0 0 1 12 0M9 15a3 3 0 0 1 6 0'

const MAP_FOLD = 'M3 6l7-3 7 3 7-3v15l-7 3-7-3-7 3V6z'

const QUOTE = 'M3 12h4l2 8 2-8h4M11 12h4l2 8 2-8h4'

const LINES = 'M4 7h16M4 12h12M4 17h14'

const PHOTO_FRAME =
  'M6 6h16v16H6zM6 6l4 4M20 20l-4-4'

const SWIRL = 'M6 16c6-8 12-10 18-4s12 2 12-6'

type MotifPartial = Omit<CoverMotifIcon, 'path' | 'x' | 'y' | 'size'> & { path: string }

function m(x: number, y: number, partial: MotifPartial & { size: number }): CoverMotifIcon {
  return {
    opacity: 0.68,
    viewBoxWidth: 24,
    strokeWidth: 2.1,
    ...partial,
    x,
    y,
  }
}

function left(size: number, y: number, partial: MotifPartial): CoverMotifIcon {
  return m(motifLeftX(size), y, { ...partial, size })
}

function right(size: number, y: number, partial: MotifPartial): CoverMotifIcon {
  return m(motifRightX(size), y, { ...partial, size })
}

const S_SM = 58
const S_MD = 72
const S_LG = 96

export const CATEGORY_COVER_MOTIFS: Record<CategoriaObra, CoverMotifIcon[]> = {
  romance: [
    left(S_LG, MOTIF_Y.upper, {
      path: COUPLE_EMBRACE,
      viewBoxWidth: 48,
      colorKey: 'text',
      opacity: 0.72,
    }),
    right(S_MD, MOTIF_Y.top, { path: HEART, colorKey: 'accent', opacity: 0.74 }),
    left(S_SM, MOTIF_Y.mid, { path: HEART, colorKey: 'frame', opacity: 0.68 }),
    right(S_SM, MOTIF_Y.lower, { path: HEART, colorKey: 'bottom', opacity: 0.66 }),
    left(S_SM, MOTIF_Y.footLeft, { path: HEART, colorKey: 'mid', opacity: 0.62 }),
    right(S_MD, MOTIF_Y.footRight, { path: HEART, colorKey: 'accent', opacity: 0.66 }),
  ],
  biografia: [
    left(S_LG, MOTIF_Y.upper, { path: TREE, colorKey: 'bottom', opacity: 0.68 }),
    right(S_MD, MOTIF_Y.top, { path: BOOK_CLOSED, colorKey: 'text', opacity: 0.66 }),
    right(S_MD, MOTIF_Y.mid, {
      path: USER,
      colorKey: 'frame',
      opacity: 0.62,
      stroke: true,
    }),
    left(S_SM, MOTIF_Y.lower, { path: FEATHER, colorKey: 'accent', opacity: 0.66 }),
    right(S_SM, MOTIF_Y.footRight, { path: PEN, colorKey: 'frame', opacity: 0.62 }),
  ],
  autobiografia: [
    left(S_MD, MOTIF_Y.top, { path: BOOK_CLOSED, colorKey: 'text', opacity: 0.66 }),
    right(S_LG, MOTIF_Y.upper, {
      path: USER,
      colorKey: 'accent',
      opacity: 0.68,
      stroke: true,
    }),
    left(S_SM, MOTIF_Y.mid, { path: PEN, colorKey: 'frame', opacity: 0.66 }),
    right(S_SM, MOTIF_Y.lower, { path: HEART, colorKey: 'mid', opacity: 0.64 }),
    left(S_SM, MOTIF_Y.footLeft, { path: FEATHER, colorKey: 'accent', opacity: 0.62 }),
  ],
  ficcao: [
    left(S_MD, MOTIF_Y.top, { path: BOOK_OPEN, colorKey: 'text', opacity: 0.68 }),
    right(S_MD, MOTIF_Y.upper, { path: SPARKLE, colorKey: 'frame', opacity: 0.74 }),
    left(S_SM, MOTIF_Y.mid, { path: SPARKLE, colorKey: 'accent', opacity: 0.7 }),
    right(S_SM, MOTIF_Y.lower, { path: SPARKLE, colorKey: 'mid', opacity: 0.66 }),
    right(S_MD, MOTIF_Y.footRight, { path: BOOK_OPEN, colorKey: 'text', opacity: 0.62 }),
  ],
  conto: [
    left(S_MD, MOTIF_Y.upper, { path: SCROLL, colorKey: 'text', opacity: 0.68 }),
    right(S_MD, MOTIF_Y.top, { path: FEATHER, colorKey: 'accent', opacity: 0.66 }),
    left(S_SM, MOTIF_Y.lower, {
      path: LINES,
      colorKey: 'frame',
      opacity: 0.62,
      stroke: true,
    }),
    right(S_SM, MOTIF_Y.mid, { path: PEN, colorKey: 'bottom', opacity: 0.62 }),
  ],
  cronica: [
    left(S_MD, MOTIF_Y.top, {
      path: CALENDAR,
      colorKey: 'text',
      opacity: 0.68,
      stroke: true,
    }),
    right(S_MD, MOTIF_Y.top, {
      path: CLOCK,
      colorKey: 'frame',
      opacity: 0.66,
      stroke: true,
    }),
    left(S_SM, MOTIF_Y.mid, {
      path: LINES,
      colorKey: 'mid',
      opacity: 0.62,
      stroke: true,
    }),
    right(S_SM, MOTIF_Y.lower, { path: FEATHER, colorKey: 'accent', opacity: 0.62 }),
  ],
  poesia: [
    right(S_LG, MOTIF_Y.upper, { path: FEATHER, colorKey: 'accent', opacity: 0.7 }),
    left(S_MD, MOTIF_Y.top, {
      path: QUOTE,
      colorKey: 'text',
      opacity: 0.66,
      stroke: true,
    }),
    left(S_SM, MOTIF_Y.lower, {
      path: SWIRL,
      colorKey: 'frame',
      opacity: 0.62,
      stroke: true,
      strokeWidth: 1.8,
    }),
    right(S_SM, MOTIF_Y.footRight, { path: SPARKLE, colorKey: 'mid', opacity: 0.66 }),
  ],
  memorias: [
    left(S_MD, MOTIF_Y.top, { path: HOURGLASS, colorKey: 'frame', opacity: 0.68 }),
    right(S_MD, MOTIF_Y.upper, {
      path: PHOTO_FRAME,
      colorKey: 'text',
      opacity: 0.66,
      stroke: true,
    }),
    left(S_SM, MOTIF_Y.mid, { path: HEART, colorKey: 'accent', opacity: 0.62 }),
    right(S_SM, MOTIF_Y.lower, { path: HOURGLASS, colorKey: 'bottom', opacity: 0.62 }),
  ],
  ensaio: [
    right(S_MD, MOTIF_Y.top, { path: LIGHTBULB, colorKey: 'frame', opacity: 0.7 }),
    left(S_MD, MOTIF_Y.upper, {
      path: GLASSES,
      colorKey: 'text',
      opacity: 0.66,
      stroke: true,
    }),
    right(S_SM, MOTIF_Y.mid, {
      path: LINES,
      colorKey: 'mid',
      opacity: 0.62,
      stroke: true,
    }),
    left(S_SM, MOTIF_Y.footLeft, { path: LIGHTBULB, colorKey: 'accent', opacity: 0.62 }),
  ],
  fantasia: [
    left(S_LG, MOTIF_Y.upper, { path: CASTLE, colorKey: 'text', opacity: 0.68 }),
    right(S_MD, MOTIF_Y.top, { path: WAND, colorKey: 'frame', opacity: 0.66 }),
    right(S_SM, MOTIF_Y.mid, { path: MOON, colorKey: 'accent', opacity: 0.66 }),
    left(S_SM, MOTIF_Y.lower, { path: SPARKLE, colorKey: 'mid', opacity: 0.72 }),
    right(S_MD, MOTIF_Y.footRight, { path: SPARKLE, colorKey: 'frame', opacity: 0.68 }),
  ],
  misterio: [
    left(S_MD, MOTIF_Y.top, {
      path: MAGNIFIER,
      colorKey: 'text',
      opacity: 0.68,
      stroke: true,
    }),
    right(S_MD, MOTIF_Y.upper, {
      path: FINGERPRINT,
      colorKey: 'frame',
      opacity: 0.66,
      stroke: true,
    }),
    left(S_SM, MOTIF_Y.mid, { path: MOON, colorKey: 'accent', opacity: 0.62 }),
    right(S_SM, MOTIF_Y.lower, { path: MAGNIFIER, colorKey: 'bottom', opacity: 0.62, stroke: true }),
  ],
  aventura: [
    left(S_LG, MOTIF_Y.upper, { path: MOUNTAIN, colorKey: 'bottom', opacity: 0.7 }),
    right(S_MD, MOTIF_Y.top, { path: COMPASS, colorKey: 'frame', opacity: 0.68 }),
    right(S_SM, MOTIF_Y.mid, {
      path: MAP_FOLD,
      colorKey: 'text',
      opacity: 0.66,
      stroke: true,
    }),
    left(S_SM, MOTIF_Y.lower, { path: COMPASS, colorKey: 'accent', opacity: 0.62 }),
    left(S_MD, MOTIF_Y.footLeft, { path: MOUNTAIN, colorKey: 'mid', opacity: 0.62 }),
  ],
  outro: [
    left(S_MD, MOTIF_Y.top, { path: PEN, colorKey: 'accent', opacity: 0.68 }),
    right(S_MD, MOTIF_Y.upper, { path: SPARKLE, colorKey: 'frame', opacity: 0.7 }),
    right(S_SM, MOTIF_Y.lower, { path: BOOK_OPEN, colorKey: 'text', opacity: 0.66 }),
    left(S_SM, MOTIF_Y.footLeft, { path: SPARKLE, colorKey: 'mid', opacity: 0.62 }),
  ],
}

export function getCategoryCoverMotifs(categoria: CategoriaObra): CoverMotifIcon[] {
  return CATEGORY_COVER_MOTIFS[categoria]
}
