import { useCallback } from 'react'
import { getSpeakSelectionText } from '@/features/accessibility/accessibilitySpeechRegistry'
import { useSpeechContext } from '@/features/accessibility/SpeechProvider'
import {
  getScreenAudioFullText,
  getScreenAudioRegionCount,
} from '@/features/accessibility/screenAudioRegistry'

export function useScreenReader() {
  const { speak, stop, isSpeaking } = useSpeechContext()

  const speakScreen = useCallback(async () => {
    const fullText = getScreenAudioFullText()
    if (fullText) {
      return speak(fullText)
    }

    if (getScreenAudioRegionCount() === 0) {
      await speak(
        'Ative o modo leitura da tela para ver botões de som em cada card e seção, ou abra um livro para ouvir o texto.',
      )
      return false
    }

    await speak('Não há conteúdo para ler nesta tela agora.')
    return false
  }, [speak])

  const speakSelection = useCallback(async () => {
    const selected = getSpeakSelectionText()
    if (!selected) {
      await speak('Selecione um trecho na leitura do livro. Toque e arraste sobre o texto.')
      return false
    }
    return speak(selected)
  }, [speak])

  return {
    isSpeaking,
    speakScreen,
    speakSelection,
    stopSpeech: stop,
  }
}
