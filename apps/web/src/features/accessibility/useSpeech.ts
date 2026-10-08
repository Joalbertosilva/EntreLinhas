import { useCallback, useRef, useState } from 'react'

function normalizeSpeechText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

export function useSpeech() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingText, setSpeakingText] = useState<string | null>(null)

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setIsSpeaking(false)
    setSpeakingText(null)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return false
      const trimmed = normalizeSpeechText(text)
      if (!trimmed) return false

      stop()
      const utterance = new SpeechSynthesisUtterance(trimmed)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.95
      utterance.onstart = () => {
        setIsSpeaking(true)
        setSpeakingText(trimmed)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        setSpeakingText(null)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        setSpeakingText(null)
      }
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
      return true
    },
    [stop],
  )

  const toggleSpeak = useCallback(
    (text: string) => {
      const trimmed = normalizeSpeechText(text)
      if (!trimmed) return false
      if (isSpeaking && speakingText === trimmed) {
        stop()
        return false
      }
      return speak(trimmed)
    },
    [isSpeaking, speak, speakingText, stop],
  )

  const isSpeakingText = useCallback(
    (text: string) => isSpeaking && speakingText === normalizeSpeechText(text),
    [isSpeaking, speakingText],
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

  return { speak, toggleSpeak, isSpeakingText, speakPage, speakSelection, stop, isSpeaking, isSupported }
}
