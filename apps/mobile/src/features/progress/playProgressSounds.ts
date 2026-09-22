import { createAudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const levelUpSource = require('../../../assets/sounds/level-up.wav')
const pageTurnSource = require('../../../assets/sounds/page-turn.wav')

async function playAsset(source: number) {
  try {
    const player = createAudioPlayer(source)
    player.play()
    setTimeout(() => {
      try {
        player.release()
      } catch {
        // noop
      }
    }, 2500)
  } catch {
    // áudio indisponível
  }
}

export async function playLevelUpSound() {
  if (Platform.OS !== 'web') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }
  await playAsset(levelUpSource)
}

export async function playPageTurnSound() {
  if (Platform.OS !== 'web') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }
  await playAsset(pageTurnSource)
}
