export type ThemeMode = 'light'

const STORAGE_KEY = 'entrelinhas-theme'

export function getStoredTheme(): ThemeMode {
  return 'light'
}

export function applyTheme(_mode: ThemeMode = 'light') {
  document.documentElement.setAttribute('data-theme', 'light')
  localStorage.setItem(STORAGE_KEY, 'light')
}
