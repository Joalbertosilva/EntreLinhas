import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { AnimatedSplash } from '@/components/splash/AnimatedSplash'
import { SPLASH_NATIVE_BG } from '@/lib/brandTheme'
import { hideNativeSplashOnce } from '@/lib/nativeSplash'
import { fetchAuthProfile, resolvePostLoginRoute } from '@/lib/authSession'
import { supabase } from '@/lib/supabase'

/**
 * Tempo mínimo com a `AnimatedSplash` visível após montar a rota `/`.
 * (A tela “EntreLinhas + loading” do Expo Go some assim que o JS monta — chamamos `hideNativeSplashOnce` abaixo.)
 */
const MIN_ANIMATED_SPLASH_VISIBLE_MS = 3000

async function resolveInitialRoute(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const session = data.session

  if (!session?.user.id) return '/(auth)/login'

  const profile = await fetchAuthProfile(session.user.id)
  if (!profile) {
    await supabase.auth.signOut()
    return '/(auth)/login'
  }

  return resolvePostLoginRoute(profile)
}

export default function SplashRoute() {
  const router = useRouter()
  const routeRef = useRef<string | null>(null)
  const [exiting, setExiting] = useState(false)
  const [navigated, setNavigated] = useState(false)

  /** Some com a tela nativa / cliente (Expo Go) assim que o primeiro frame do app existir. */
  useEffect(() => {
    hideNativeSplashOnce()
  }, [])

  useEffect(() => {
    const startedAt = Date.now()
    let cancelled = false
    let exitTimer: ReturnType<typeof setTimeout> | undefined

    void resolveInitialRoute().then((route) => {
      if (cancelled) return
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, MIN_ANIMATED_SPLASH_VISIBLE_MS - elapsed)
      exitTimer = setTimeout(() => {
        if (cancelled) return
        routeRef.current = route
        setExiting(true)
      }, remaining)
    })

    return () => {
      cancelled = true
      if (exitTimer) clearTimeout(exitTimer)
    }
  }, [])

  const onExitComplete = useCallback(() => {
    if (navigated || !routeRef.current) return
    setNavigated(true)
    router.replace(routeRef.current as never)
  }, [navigated, router])

  return (
    <View style={{ flex: 1, backgroundColor: SPLASH_NATIVE_BG }}>
      <AnimatedSplash exiting={exiting} onExitComplete={onExitComplete} />
    </View>
  )
}
