import { useCallback } from 'react'
import { getSpeakSelectionText } from '@/features/accessibility/accessibilitySpeechRegistry'
import { useSpeechContext } from '@/features/accessibility/SpeechProvider'
import {
  getScreenAudioFullText,
  getScreenAudioRegionCount,
} from '@/features/accessibility/screenAudioRegistry'

export function useScreenReader() {
  const { toggleSpeak, stop, isSpeaking, isAudioPlaying } = useSpeechContext()

  const speakScreen = useCallback(async () => {
    if (await isAudioPlaying()) {
      await stop()
      return false
    }

    const fullText = getScreenAudioFullText()
    if (fullText) {
      return toggleSpeak(fullText)
    }

    if (getScreenAudioRegionCount() === 0) {
      return toggleSpeak(
        'Ative o modo leitura da tela para ver botões de som em cada card e seção, ou abra um livro para ouvir o texto.',
      )
    }

    return toggleSpeak('Não há conteúdo para ler nesta tela agora.')
  }, [isAudioPlaying, stop, toggleSpeak])

  const speakSelection = useCallback(async () => {
    if (await isAudioPlaying()) {
      await stop()
      return false
    }

    const selected = getSpeakSelectionText()
    if (!selected) {
      return toggleSpeak('Selecione um trecho na leitura do livro. Toque e arraste sobre o texto.')
    }
    return toggleSpeak(selected)
  }, [isAudioPlaying, stop, toggleSpeak])

  return {
    isSpeaking,
    speakScreen,
    speakSelection,
    stopSpeech: stop,
  }
}
