import { useCallback, useRef } from 'react'

export function useSpeech() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    utteranceRef.current = null
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return false
      const trimmed = text.replace(/\s+/g, ' ').trim()
      if (!trimmed) return false

      stop()
      const utterance = new SpeechSynthesisUtterance(trimmed)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.95
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
      return true
    },
    [stop],
  )

  const speakPage = useCallback(() => {
    const main = document.getElementById('conteudo-principal')
    if (!main) return false
    return speak(main.innerText)
  }, [speak])

  const speakSelection = useCallback(() => {
    if (typeof window === 'undefined') return false
    const selection = window.getSelection()?.toString().replace(/\s+/g, ' ').trim()
    if (selection && selection.length > 0) return speak(selection)
    return speakPage()
  }, [speak, speakPage])

  const isSupported =
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof SpeechSynthesisUtterance !== 'undefined'

  return { speak, speakPage, speakSelection, stop, isSupported }
}
