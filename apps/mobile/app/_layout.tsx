import '../global.css'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GlobalAccessibilityLayer } from '@/components/layout/GlobalAccessibilityLayer'
import { AccessibilityProvider } from '@/features/accessibility/AccessibilityProvider'
import { SpeechProvider } from '@/features/accessibility/SpeechProvider'
import { ProgressCelebrationProvider } from '@/features/progress/ProgressCelebrationProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { FontsProvider } from '@/providers/FontsProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { SPLASH_NATIVE_BG } from '@/lib/brandTheme'
import { configureNativeSplashFade } from '@/lib/nativeSplash'

SplashScreen.preventAutoHideAsync().catch(() => undefined)
configureNativeSplashFade()

export default function RootLayout() {
  return (
    <FontsProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: SPLASH_NATIVE_BG }}>
        <SafeAreaProvider>
          <AccessibilityProvider>
            <SpeechProvider>
              <QueryProvider>
                <AuthProvider>
                  <ProgressCelebrationProvider>
                    <View style={{ flex: 1, backgroundColor: SPLASH_NATIVE_BG }}>
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          animation: 'fade',
                          contentStyle: { backgroundColor: SPLASH_NATIVE_BG },
                        }}
                      />
                      <GlobalAccessibilityLayer />
                    </View>
                  </ProgressCelebrationProvider>
                </AuthProvider>
              </QueryProvider>
            </SpeechProvider>
          </AccessibilityProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </FontsProvider>
  )
}
