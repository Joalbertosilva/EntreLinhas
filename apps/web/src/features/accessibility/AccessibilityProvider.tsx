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
  loadAudioPreference,
  loadFontScale,
  saveAccessibilityMode,
  saveAudioPreference,
  saveFontScale,
  type FontScale,
} from '@/features/accessibility/accessibilityStorage'
import { useSpeech } from '@/features/accessibility/useSpeech'

interface AccessibilityState {
  modeEnabled: boolean
  screenExplorerMode: boolean
  fontScale: FontScale
  fontScalePercent: number
  audioEnabled: boolean | null
  isSpeaking: boolean
  setModeEnabled: (enabled: boolean) => void
  setScreenExplorerMode: (enabled: boolean) => void
  setAudioEnabled: (enabled: boolean) => void
  increaseFont: () => void
  decreaseFont: () => void
  resetFont: () => void
  speak: (text: string) => boolean
  toggleSpeak: (text: string) => boolean
  isSpeakingText: (text: string) => boolean
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
  const [screenExplorerMode, setScreenExplorerModeState] = useState(false)
  const [fontScale, setFontScaleState] = useState<FontScale>(loadFontScale)
  const [audioEnabled, setAudioEnabledState] = useState<boolean | null>(loadAudioPreference)
  const { speak, toggleSpeak, isSpeakingText, speakPage, speakSelection, stop, isSpeaking, isSupported } =
    useSpeech()

  useEffect(() => {
    applyFontScale(fontScale)
  }, [fontScale])

  const setModeEnabled = useCallback(
    (enabled: boolean) => {
      setModeEnabledState(enabled)
      saveAccessibilityMode(enabled)
      if (!enabled) stop()
    },
    [stop],
  )

  const setScreenExplorerMode = useCallback(
    (enabled: boolean) => {
      setScreenExplorerModeState(enabled)
      if (!enabled) stop()
    },
    [stop],
  )

  const setAudioEnabled = useCallback(
    (enabled: boolean) => {
      setAudioEnabledState(enabled)
      saveAudioPreference(enabled)
      setScreenExplorerModeState(enabled)
    },
    [],
  )

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
      screenExplorerMode,
      fontScale,
      fontScalePercent: FONT_SCALE_PERCENT[fontScale],
      audioEnabled,
      isSpeaking,
      setModeEnabled,
      setScreenExplorerMode,
      setAudioEnabled,
      increaseFont,
      decreaseFont,
      resetFont,
      speak,
      toggleSpeak,
      isSpeakingText,
      speakPage,
      speakSelection,
      stopSpeech: stop,
      speechSupported: isSupported,
    }),
    [
      modeEnabled,
      screenExplorerMode,
      fontScale,
      audioEnabled,
      isSpeaking,
      setModeEnabled,
      setScreenExplorerMode,
      setAudioEnabled,
      increaseFont,
      decreaseFont,
      resetFont,
      speak,
      toggleSpeak,
      isSpeakingText,
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
