import { useEffect, useRef } from 'react'
import { resetScreenAudioRegions } from '@/features/accessibility/screenAudioRegistry'

/** Limpa regiões de áudio quando a camada global monta (evita hook fora de tela). */
export function useScreenAudioSession() {
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      resetScreenAudioRegions()
    }
    return () => {
      resetScreenAudioRegions()
    }
  }, [])
}
