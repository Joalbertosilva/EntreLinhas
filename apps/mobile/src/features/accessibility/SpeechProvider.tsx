import { createContext, useContext, type ReactNode } from 'react'
import { useSpeech } from '@/features/accessibility/useSpeech'

type SpeechContextValue = ReturnType<typeof useSpeech>

const SpeechContext = createContext<SpeechContextValue | null>(null)

export function SpeechProvider({ children }: { children: ReactNode }) {
  const speech = useSpeech()
  return <SpeechContext.Provider value={speech}>{children}</SpeechContext.Provider>
}

export function useSpeechContext() {
  const ctx = useContext(SpeechContext)
  if (!ctx) throw new Error('useSpeechContext must be used within SpeechProvider')
  return ctx
}
