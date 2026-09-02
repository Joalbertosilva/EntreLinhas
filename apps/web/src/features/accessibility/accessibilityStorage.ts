export type FontScale = 'normal' | 'large' | 'xlarge' | 'xxlarge'

const FONT_KEY = 'entrelinhas-a11y-font'
const MODE_KEY = 'entrelinhas-a11y-mode'

export function loadFontScale(): FontScale {
  const v = localStorage.getItem(FONT_KEY)
  if (v === 'large' || v === 'xlarge' || v === 'xxlarge') return v
  return 'normal'
}

export function saveFontScale(scale: FontScale) {
  localStorage.setItem(FONT_KEY, scale)
}

export function loadAccessibilityMode(): boolean {
  return localStorage.getItem(MODE_KEY) === '1'
}

export function saveAccessibilityMode(enabled: boolean) {
  localStorage.setItem(MODE_KEY, enabled ? '1' : '0')
}

export const FONT_SCALE_PERCENT: Record<FontScale, number> = {
  normal: 100,
  large: 112,
  xlarge: 125,
  xxlarge: 150,
}
