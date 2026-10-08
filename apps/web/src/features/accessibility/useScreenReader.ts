import { useCallback } from 'react'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import {
  getScreenAudioFullText,
  getScreenAudioRegionCount,
} from '@/features/accessibility/screenAudioRegistry'

export function useScreenReader() {
  const { speak, speakSelection, stopSpeech, isSpeaking } = useAccessibility()

  const speakScreen = useCallback(() => {
    const fullText = getScreenAudioFullText()
    if (fullText) {
      return speak(fullText)
    }

    if (getScreenAudioRegionCount() === 0) {
      speak(
        'Ative o modo leitura da tela para ver botões de som em cada card e seção, ou selecione um trecho para ouvir.',
      )
      return false
    }

    speak('Não há conteúdo para ler nesta tela agora.')
    return false
  }, [speak])

  return {
    isSpeaking,
    speakScreen,
    speakSelection,
    stopSpeech,
  }
}
