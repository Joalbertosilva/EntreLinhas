import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'

const HOME: Href = '/(aluno)/(tabs)'

export function useGoHome() {
  const router = useRouter()

  return useCallback(() => {
    router.replace(HOME)
  }, [router])
}
