import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  FONT_SCALE_PERCENT,
  loadAccessibilityMode,
  loadFontScale,
  saveAccessibilityMode,
  saveFontScale,
  type FontScale,
} from '@/features/accessibility/accessibilityStorage'
import { useSpeech } from '@/features/accessibility/useSpeech'

interface AccessibilityState {
  modeEnabled: boolean
  fontScale: FontScale
  fontScalePercent: number
  setModeEnabled: (enabled: boolean) => void
  increaseFont: () => void
  decreaseFont: () => void
  resetFont: () => void
  speak: (text: string) => boolean
  speakPage: () => boolean
  speakSelection: () => boolean
  stopSpeech: () => void
  speechSupported: boolean
}

const AccessibilityContext = createContext<AccessibilityState | null>(null)

const FONT_ORDER: FontScale[] = ['normal', 'large', 'xlarge', 'xxlarge']

function applyFontScale(scale: FontScale) {
  document.documentElement.dataset.a11yFont = scale
  document.documentElement.style.fontSize = `${FONT_SCALE_PERCENT[scale]}%`
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [modeEnabled, setModeEnabledState] = useState(loadAccessibilityMode)
  const [fontScale, setFontScaleState] = useState<FontScale>(loadFontScale)
  const { speak, speakPage, speakSelection, stop, isSupported } = useSpeech()

  useEffect(() => {
    applyFontScale(fontScale)
  }, [fontScale])

  const setModeEnabled = useCallback((enabled: boolean) => {
    setModeEnabledState(enabled)
    saveAccessibilityMode(enabled)
    if (!enabled) stop()
  }, [stop])

  const setFontScale = useCallback((scale: FontScale) => {
    setFontScaleState(scale)
    saveFontScale(scale)
  }, [])

  const increaseFont = useCallback(() => {
    const idx = FONT_ORDER.indexOf(fontScale)
    if (idx < FONT_ORDER.length - 1) setFontScale(FONT_ORDER[idx + 1]!)
  }, [fontScale, setFontScale])

  const decreaseFont = useCallback(() => {
    const idx = FONT_ORDER.indexOf(fontScale)
    if (idx > 0) setFontScale(FONT_ORDER[idx - 1]!)
  }, [fontScale, setFontScale])

  const resetFont = useCallback(() => setFontScale('normal'), [setFontScale])

  const value = useMemo<AccessibilityState>(
    () => ({
      modeEnabled,
      fontScale,
      fontScalePercent: FONT_SCALE_PERCENT[fontScale],
      setModeEnabled,
      increaseFont,
      decreaseFont,
      resetFont,
      speak,
      speakPage,
      speakSelection,
      stopSpeech: stop,
      speechSupported: isSupported,
    }),
    [
      modeEnabled,
      fontScale,
      setModeEnabled,
      increaseFont,
      decreaseFont,
      resetFont,
      speak,
      speakPage,
      speakSelection,
      stop,
      isSupported,
    ],
  )

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider')
  return ctx
}
