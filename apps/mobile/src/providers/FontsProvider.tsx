import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans'
import { useEffect, type ReactNode } from 'react'
import { configureNativeSplashFade } from '@/lib/nativeSplash'

/**
 * Carrega fontes em paralelo à árvore de rotas. Antes, o layout raiz dava `return null` até as fontes —
 * o `Stack` não montava e a splash animada só aparecia **depois** do download (vários segundos no Expo Go).
 * Não bloqueamos mais: `fontFamily` usa fallback do sistema até a fonte nativa carregar.
 */
export function FontsProvider({ children }: { children: ReactNode }) {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) configureNativeSplashFade()
  }, [fontError, fontsLoaded])

  return <>{children}</>
}
