import { useEffect, useRef } from 'react'
import { resetScreenAudioRegions } from '@/features/accessibility/screenAudioRegistry'

/** Limpa regiões de áudio ao montar/desmontar a camada global. */
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
