type Listener = () => void

let fontMultiplier = 1
const listeners = new Set<Listener>()

export function getFontMultiplier() {
  return fontMultiplier
}

export function setFontMultiplier(value: number) {
  if (fontMultiplier === value) return
  fontMultiplier = value
  listeners.forEach((listener) => listener())
}

export function subscribeFontMultiplier(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
