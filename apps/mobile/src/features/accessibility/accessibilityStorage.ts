import AsyncStorage from '@react-native-async-storage/async-storage'

export type FontScale = 'normal' | 'large' | 'xlarge' | 'xxlarge'

const FONT_KEY = 'entrelinhas-a11y-font'
const AUDIO_KEY = 'entrelinhas-a11y-audio'

export const FONT_SCALE_MULTIPLIER: Record<FontScale, number> = {
  normal: 1,
  large: 1.12,
  xlarge: 1.25,
  xxlarge: 1.5,
}

export async function loadFontScale(): Promise<FontScale> {
  const v = await AsyncStorage.getItem(FONT_KEY)
  if (v === 'large' || v === 'xlarge' || v === 'xxlarge') return v
  return 'normal'
}

export async function saveFontScale(scale: FontScale) {
  await AsyncStorage.setItem(FONT_KEY, scale)
}

export async function loadAudioPreference(): Promise<boolean | null> {
  const v = await AsyncStorage.getItem(AUDIO_KEY)
  if (v === '1') return true
  if (v === '0') return false
  return null
}

export async function saveAudioPreference(enabled: boolean) {
  await AsyncStorage.setItem(AUDIO_KEY, enabled ? '1' : '0')
}
