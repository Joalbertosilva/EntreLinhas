import { useRouter, type Href } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { BackHandler } from 'react-native'

const DEFAULT_HOME: Href = '/(aluno)/(tabs)'

/** Volta na pilha ou substitui pela rota inicial quando não há histórico. */
export function useGoBack(fallback: Href = DEFAULT_HOME) {
  const router = useRouter()

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(fallback)
    }
  }, [router, fallback])

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack()
      return true
    })
    return () => sub.remove()
  }, [goBack])

  return goBack
}
