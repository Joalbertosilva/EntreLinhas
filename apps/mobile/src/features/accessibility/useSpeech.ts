import * as Speech from 'expo-speech'
import { useCallback, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'

const SPEECH_LANG = 'pt-BR'
/** 1.0 = velocidade normal no expo-speech (iOS multiplica pela taxa padrão do sistema). */
const SPEECH_RATE = 1.05
const PT_BR_VOICE_HINTS = ['luciana', 'felipe']
/** iOS costuma truncar utterances muito longas — fragmentamos por frases. */
const SPEECH_CHUNK_MAX = 3200

function splitForSpeech(text: string, maxLen = SPEECH_CHUNK_MAX): string[] {
  if (text.length <= maxLen) return [text]
  const chunks: string[] = []
  let rest = text
  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf('. ', maxLen)
    if (cut < maxLen * 0.45) cut = rest.lastIndexOf('! ', maxLen)
    if (cut < maxLen * 0.45) cut = rest.lastIndexOf('? ', maxLen)
    if (cut < maxLen * 0.45) cut = rest.lastIndexOf('\n', maxLen)
    if (cut < maxLen * 0.45) cut = rest.lastIndexOf(' ', maxLen)
    if (cut <= 0) cut = maxLen
    else cut += 1
    const piece = rest.slice(0, cut).trim()
    if (piece) chunks.push(piece)
    rest = rest.slice(cut).trim()
  }
  if (rest) chunks.push(rest)
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)]
}

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
  const startingRef = useRef(false)
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
    startingRef.current = false
    markStopped()
    try {
      await Speech.stop()
    } catch {
      // noop
    }
  }, [markStopped])

  const isAudioPlaying = useCallback(async () => {
    if (activeRef.current || startingRef.current) return true
    try {
      return await Speech.isSpeakingAsync()
    } catch {
      return false
    }
  }, [])

  const speakChunk = useCallback(
    async (
      trimmed: string,
      voice: string | undefined,
      options: { quiet?: boolean; onQueueDone?: () => void },
    ) => {
      return new Promise<boolean>((resolve) => {
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
            onDone: () => {
              options.onQueueDone?.()
              resolve(true)
            },
            onStopped: () => {
              options.onQueueDone?.()
              resolve(false)
            },
            onError: () => {
              options.onQueueDone?.()
              if (!options.quiet) {
                Alert.alert('Áudio', 'Não foi possível reproduzir. Verifique o volume do aparelho.')
              }
              resolve(false)
            },
          })
        } catch {
          options.onQueueDone?.()
          resolve(false)
        }
      })
    },
    [],
  )

  const speak = useCallback(
    async (text: string, options?: { quiet?: boolean }) => {
      if (activeRef.current || startingRef.current) {
        await stop()
        return false
      }

      let systemSpeaking = false
      try {
        systemSpeaking = await Speech.isSpeakingAsync()
      } catch {
        systemSpeaking = false
      }
      if (systemSpeaking) {
        await stop()
        return false
      }

      const trimmed = text.replace(/\s+/g, ' ').trim()
      if (!trimmed) {
        if (!options?.quiet) {
          Alert.alert('Áudio', 'Não há texto para ler nesta tela.')
        }
        return false
      }

      clearResetTimer()

      startingRef.current = true
      activeRef.current = true
      setIsSpeaking(true)

      const chunks = splitForSpeech(trimmed)
      const totalLen = chunks.reduce((n, c) => n + c.length, 0)
      resetTimerRef.current = setTimeout(() => {
        if (activeRef.current) markStopped()
      }, Math.max(15000, totalLen * 85))

      const voice = await resolvePtBrVoice()

      if (!activeRef.current) {
        startingRef.current = false
        return false
      }

      try {
        for (let i = 0; i < chunks.length; i += 1) {
          if (!activeRef.current) break
          const chunk = chunks[i]!
          const isLast = i === chunks.length - 1
          const ok = await speakChunk(chunk, voice, {
            quiet: options?.quiet,
            onQueueDone: () => {
              if (isLast) {
                startingRef.current = false
                markStopped()
              }
            },
          })
          if (!ok) {
            startingRef.current = false
            markStopped()
            return false
          }
          if (!activeRef.current) break
          if (!isLast) {
            await new Promise((resolve) => setTimeout(resolve, Platform.OS === 'ios' ? 100 : 60))
          }
        }
        startingRef.current = false
        return true
      } catch {
        startingRef.current = false
        markStopped()
        if (!options?.quiet) {
          Alert.alert('Áudio', 'Não foi possível reproduzir o áudio agora.')
        }
        return false
      }
    },
    [clearResetTimer, markStopped, speakChunk, stop],
  )

  const toggleSpeak = useCallback(
    async (text: string, options?: { quiet?: boolean }) => {
      if (await isAudioPlaying()) {
        await stop()
        return false
      }
      return speak(text, options)
    },
    [isAudioPlaying, speak, stop],
  )

  return { speak, toggleSpeak, stop, isSpeaking, isAudioPlaying, isSupported: true }
}
