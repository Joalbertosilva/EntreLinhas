import * as Speech from 'expo-speech'
import { useCallback, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'

const SPEECH_LANG = 'pt-BR'
/** 1.0 = velocidade normal no expo-speech (iOS multiplica pela taxa padrão do sistema). */
const SPEECH_RATE = 1.05
const PT_BR_VOICE_HINTS = ['luciana', 'felipe']

let cachedPtBrVoice: string | undefined

function isPtBrLanguage(language: string) {
  const tag = language.replace('_', '-').toLowerCase()
  return tag === 'pt-br' || tag.startsWith('pt-br-')
}

function scorePtBrVoice(voice: Speech.Voice) {
  let score = 0
  if (voice.quality === Speech.VoiceQuality.Enhanced) score += 10
  const name = voice.name.toLowerCase()
  if (PT_BR_VOICE_HINTS.some((hint) => name.includes(hint))) score += 5
  return score
}

async function resolvePtBrVoice(): Promise<string | undefined> {
  if (cachedPtBrVoice !== undefined) return cachedPtBrVoice || undefined
  try {
    const voices = await Speech.getAvailableVoicesAsync()
    const ptBrVoices = voices.filter((voice) => isPtBrLanguage(voice.language))
    if (ptBrVoices.length === 0) {
      cachedPtBrVoice = ''
      return undefined
    }
    ptBrVoices.sort((a, b) => scorePtBrVoice(b) - scorePtBrVoice(a))
    cachedPtBrVoice = ptBrVoices[0].identifier
    return cachedPtBrVoice
  } catch {
    cachedPtBrVoice = ''
    return undefined
  }
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
      }, Math.max(10000, trimmed.length * 70))

      const voice = await resolvePtBrVoice()

      try {
        Speech.speak(trimmed, {
          language: SPEECH_LANG,
          ...(voice ? { voice } : {}),
          rate: SPEECH_RATE,
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
