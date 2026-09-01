export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'entrelinhas-theme'

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
  localStorage.setItem(STORAGE_KEY, mode)
}

export function initTheme() {
  applyTheme(getStoredTheme())
}
