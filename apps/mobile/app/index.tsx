import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { AnimatedSplash } from '@/components/splash/AnimatedSplash'
import { fetchAuthProfile, resolvePostLoginRoute } from '@/lib/authSession'
import { supabase } from '@/lib/supabase'

const MIN_SPLASH_MS = 2200

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

  useEffect(() => {
    let cancelled = false

    void Promise.all([resolveInitialRoute(), new Promise((r) => setTimeout(r, MIN_SPLASH_MS))]).then(
      ([route]) => {
        if (cancelled) return
        routeRef.current = route
        setExiting(true)
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  const onExitComplete = useCallback(() => {
    if (navigated || !routeRef.current) return
    setNavigated(true)
    router.replace(routeRef.current as never)
  }, [navigated, router])

  return (
    <View style={{ flex: 1 }}>
      <AnimatedSplash exiting={exiting} onExitComplete={onExitComplete} />
    </View>
  )
}
