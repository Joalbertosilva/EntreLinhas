type SpeakFn = () => string | null | undefined

const speakScreenRef: { current: SpeakFn | null } = { current: null }
const speakSelectionRef: { current: SpeakFn | null } = { current: null }

export function registerSpeakScreen(fn: SpeakFn | null) {
  speakScreenRef.current = fn
}

export function registerSpeakSelection(fn: SpeakFn | null) {
  speakSelectionRef.current = fn
}

export function getSpeakScreenText() {
  return speakScreenRef.current?.()?.trim() ?? null
}

export function getSpeakSelectionText() {
  return speakSelectionRef.current?.()?.trim() ?? null
}
