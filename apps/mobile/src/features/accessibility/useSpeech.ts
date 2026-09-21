import * as Speech from 'expo-speech'
import { useCallback, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'

const SPEECH_LANG = 'pt-BR'
let cachedPtVoice: string | undefined

async function resolvePtVoice() {
  if (cachedPtVoice !== undefined) return cachedPtVoice
  try {
    const voices = await Speech.getAvailableVoicesAsync()
    cachedPtVoice =
      voices.find((voice) => voice.language.toLowerCase().startsWith('pt'))?.identifier ?? ''
  } catch {
    cachedPtVoice = ''
  }
  return cachedPtVoice
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const activeRef = useRef(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  const markStopped = useCallback(() => {
    activeRef.current = false
    setIsSpeaking(false)
    clearResetTimer()
  }, [clearResetTimer])

  const stop = useCallback(async () => {
    markStopped()
    try {
      await Speech.stop()
    } catch {
      // noop
    }
  }, [markStopped])

  const speak = useCallback(
    async (text: string, options?: { quiet?: boolean }) => {
      const trimmed = text.replace(/\s+/g, ' ').trim()
      if (!trimmed) {
        if (!options?.quiet) {
          Alert.alert('Áudio', 'Não há texto para ler nesta tela.')
        }
        return false
      }

      clearResetTimer()

      try {
        if (await Speech.isSpeakingAsync()) {
          await Speech.stop()
          await new Promise((resolve) => setTimeout(resolve, Platform.OS === 'ios' ? 200 : 100))
        }
      } catch {
        // noop
      }

      activeRef.current = true
      setIsSpeaking(true)

      resetTimerRef.current = setTimeout(() => {
        if (activeRef.current) markStopped()
      }, Math.max(10000, trimmed.length * 90))

      const voice = await resolvePtVoice()

      try {
        Speech.speak(trimmed, {
          language: SPEECH_LANG,
          ...(voice ? { voice } : {}),
          rate: Platform.OS === 'ios' ? 0.52 : 0.95,
          pitch: 1,
          volume: 1,
          onStart: () => {
            if (activeRef.current) setIsSpeaking(true)
          },
          onDone: () => markStopped(),
          onStopped: () => markStopped(),
          onError: () => {
            markStopped()
            if (!options?.quiet) {
              Alert.alert('Áudio', 'Não foi possível reproduzir. Verifique o volume do iPhone.')
            }
          },
        })
        return true
      } catch {
        markStopped()
        if (!options?.quiet) {
          Alert.alert('Áudio', 'Não foi possível reproduzir o áudio agora.')
        }
        return false
      }
    },
    [clearResetTimer, markStopped],
  )

  return { speak, stop, isSpeaking, isSupported: true }
}
