import { createAudioPlayer, preload, setAudioModeAsync } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const levelUpSource = require('../../../assets/sounds/level-up.wav')
const pageTurnSource = require('../../../assets/sounds/page-turn.wav')

let audioReady = false

async function ensureAudioReady() {
  if (audioReady) return
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    allowsRecording: false,
  })
  await Promise.all([preload(levelUpSource), preload(pageTurnSource)])
  audioReady = true
}

async function playAsset(source: number) {
  await ensureAudioReady()
  const player = createAudioPlayer(source, { keepAudioSessionActive: true })
  player.volume = 1
  player.play()
  setTimeout(() => {
    try {
      player.release()
    } catch {
      // noop
    }
  }, 3000)
}

export async function playLevelUpSound() {
  if (Platform.OS !== 'web') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }
  try {
    await playAsset(levelUpSource)
  } catch {
    // áudio indisponível no dispositivo
  }
}

export async function playPageTurnSound() {
  if (Platform.OS !== 'web') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }
  try {
    await playAsset(pageTurnSource)
  } catch {
    // áudio indisponível no dispositivo
  }
}
