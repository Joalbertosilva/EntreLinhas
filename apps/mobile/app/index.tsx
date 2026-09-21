import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { AnimatedSplash } from '@/components/splash/AnimatedSplash'
import { fetchAuthProfile, resolvePostLoginRoute } from '@/lib/authSession'
import { supabase } from '@/lib/supabase'

export default function SplashRoute() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  const navigateAfterSplash = useCallback(async () => {
    if (ready) return
    setReady(true)

    const { data } = await supabase.auth.getSession()
    const session = data.session

    if (!session?.user.id) {
      router.replace('/(auth)/login')
      return
    }

    const profile = await fetchAuthProfile(session.user.id)
    if (!profile) {
      await supabase.auth.signOut()
      router.replace('/(auth)/login')
      return
    }

    router.replace(await resolvePostLoginRoute(profile) as never)
  }, [ready, router])

  return <AnimatedSplash onFinish={() => void navigateAfterSplash()} />
}
