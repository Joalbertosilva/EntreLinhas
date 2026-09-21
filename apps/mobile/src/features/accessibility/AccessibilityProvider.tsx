import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setFontMultiplier } from '@/features/accessibility/accessibilityFontScale'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  FONT_SCALE_MULTIPLIER,
  loadAudioPreference,
  loadFontScale,
  saveAudioPreference,
  saveFontScale,
  type FontScale,
} from '@/features/accessibility/accessibilityStorage'

interface AccessibilityContextValue {
  modeEnabled: boolean
  setModeEnabled: (enabled: boolean) => void
  screenExplorerMode: boolean
  setScreenExplorerMode: (enabled: boolean) => void
  fontScale: FontScale
  fontMultiplier: number
  fontScalePercent: number
  increaseFont: () => void
  decreaseFont: () => void
  resetFont: () => void
  audioEnabled: boolean | null
  setAudioEnabled: (enabled: boolean) => void
}

const ORDER: FontScale[] = ['normal', 'large', 'xlarge', 'xxlarge']

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [modeEnabled, setModeEnabledState] = useState(false)
  const [screenExplorerMode, setScreenExplorerModeState] = useState(false)
  const [fontScale, setFontScale] = useState<FontScale>('normal')
  const [audioEnabled, setAudioEnabledState] = useState<boolean | null>(null)

  useEffect(() => {
    void AsyncStorage.removeItem('entrelinhas-a11y-mode')
    void Promise.all([loadFontScale(), loadAudioPreference()]).then(([scale, audio]) => {
      setFontScale(scale)
      setAudioEnabledState(audio)
    })
  }, [])

  const setModeEnabled = useCallback((enabled: boolean) => {
    setModeEnabledState(enabled)
  }, [])

  const setScreenExplorerMode = useCallback((enabled: boolean) => {
    setScreenExplorerModeState(enabled)
  }, [])

  const setAudioEnabled = useCallback((enabled: boolean) => {
    setAudioEnabledState(enabled)
    void saveAudioPreference(enabled)
  }, [])

  const updateFont = useCallback((scale: FontScale) => {
    setFontScale(scale)
    void saveFontScale(scale)
  }, [])

  const increaseFont = useCallback(() => {
    const idx = ORDER.indexOf(fontScale)
    if (idx < ORDER.length - 1) updateFont(ORDER[idx + 1]!)
  }, [fontScale, updateFont])

  const decreaseFont = useCallback(() => {
    const idx = ORDER.indexOf(fontScale)
    if (idx > 0) updateFont(ORDER[idx - 1]!)
  }, [fontScale, updateFont])

  const resetFont = useCallback(() => updateFont('normal'), [updateFont])

  const fontMultiplier = FONT_SCALE_MULTIPLIER[fontScale]
  const fontScalePercent = Math.round(fontMultiplier * 100)

  useEffect(() => {
    setFontMultiplier(fontMultiplier)
  }, [fontMultiplier])

  const value = useMemo(
    () => ({
      modeEnabled,
      setModeEnabled,
      screenExplorerMode,
      setScreenExplorerMode,
      fontScale,
      fontMultiplier,
      fontScalePercent,
      increaseFont,
      decreaseFont,
      resetFont,
      audioEnabled,
      setAudioEnabled,
    }),
    [
      modeEnabled,
      setModeEnabled,
      screenExplorerMode,
      setScreenExplorerMode,
      fontScale,
      fontMultiplier,
      fontScalePercent,
      increaseFont,
      decreaseFont,
      resetFont,
      audioEnabled,
      setAudioEnabled,
    ],
  )

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider')
  return ctx
}

export function useScaledFont(baseSize: number) {
  const { fontMultiplier } = useAccessibility()
  return Math.round(baseSize * fontMultiplier)
}
