import '../global.css'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans'
import { GlobalAccessibilityLayer } from '@/components/layout/GlobalAccessibilityLayer'
import { AccessibilityProvider } from '@/features/accessibility/AccessibilityProvider'
import { SpeechProvider } from '@/features/accessibility/SpeechProvider'
import { ProgressCelebrationProvider } from '@/features/progress/ProgressCelebrationProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'

SplashScreen.preventAutoHideAsync().catch(() => undefined)

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined)
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AccessibilityProvider>
          <SpeechProvider>
            <QueryProvider>
              <AuthProvider>
                <ProgressCelebrationProvider>
                  <View style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
                    <GlobalAccessibilityLayer />
                  </View>
                </ProgressCelebrationProvider>
              </AuthProvider>
            </QueryProvider>
          </SpeechProvider>
        </AccessibilityProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
