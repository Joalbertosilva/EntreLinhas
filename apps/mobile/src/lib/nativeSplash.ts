import * as SplashScreen from 'expo-splash-screen'

let hideRequested = false

/** Esconde a splash nativa uma única vez — chamar quando a AnimatedSplash já estiver pintada. */
export function hideNativeSplashOnce(): void {
  if (hideRequested) return
  hideRequested = true
  SplashScreen.hideAsync().catch(() => undefined)
}

/** iOS: crossfade curto da nativa para a splash animada (ignorado no Expo Go). */
export function configureNativeSplashFade(): void {
  try {
    SplashScreen.setOptions({ fade: true, duration: 220 })
  } catch {
    // Expo Go / ambientes sem módulo nativo customizado
  }
}
