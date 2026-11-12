export interface CoverPaletteColors {
  text: string
  bottom: string
  mid: string
  top: string
  frame: string
}

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.trim().replace('#', '')
  if (h.length === 3) {
    return [
      parseInt(h[0]! + h[0], 16),
      parseInt(h[1]! + h[1], 16),
      parseInt(h[2]! + h[2], 16),
    ]
  }
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  return null
}

function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex)
  if (!rgb) return 0.5
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

/** Texto sobre o painel claro (gradiente branco) na base da capa. */
export function coverTextOnLightPanel(palette: CoverPaletteColors): string {
  if (relativeLuminance(palette.text) > 0.55) {
    return palette.bottom
  }
  return palette.text
}

/** Kicker e rótulos sobre o fundo em gradiente (zona superior). */
export function coverTextOnGradient(palette: CoverPaletteColors): string {
  const topLum = relativeLuminance(palette.top)
  const textLum = relativeLuminance(palette.text)
  if (topLum > 0.72 && textLum > 0.5) {
    return palette.bottom
  }
  if (textLum > 0.78) {
    return palette.bottom
  }
  return palette.text
}

export const COVER_TITLE_FONT_FAMILY = 'Georgia, "Times New Roman", "Liberation Serif", serif'
export const COVER_UI_FONT_FAMILY = '"Plus Jakarta Sans", system-ui, sans-serif'
