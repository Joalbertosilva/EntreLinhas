import { useEffect, useRef } from 'react'
import { registerSpeakScreen } from '@/features/accessibility/accessibilitySpeechRegistry'

/** Registra texto da tela atual para "Ouvir leitura da tela". */
export function useSpeakScreenRegistration(buildText: () => string | null | undefined) {
  const buildRef = useRef(buildText)
  buildRef.current = buildText

  useEffect(() => {
    registerSpeakScreen(() => buildRef.current()?.trim() ?? null)
    return () => registerSpeakScreen(null)
  }, [])
}
