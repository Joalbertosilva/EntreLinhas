import { Pressable, Text, View } from 'react-native'
import { Volume2, X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { AccessibilityToolbar, AccessibilityTrigger } from '@/features/accessibility/AccessibilityToolbar'
import { useScreenAudioSession } from '@/features/accessibility/useScreenAudioSession'
import { useScreenReader } from '@/features/accessibility/useScreenReader'

/** Botão flutuante + banner de leitura da tela — sem overlay de tela inteira. */
export function GlobalAccessibilityLayer() {
  const insets = useSafeAreaInsets()
  const { screenExplorerMode, setScreenExplorerMode } = useAccessibility()
  const reader = useScreenReader()
  useScreenAudioSession()

  return (
    <>
      {screenExplorerMode ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 16,
            right: 72,
            zIndex: 50,
            elevation: 50,
          }}
        >
          <View className="flex-row items-center gap-2 rounded-2xl border border-primary/20 bg-white px-3 py-2 shadow-md">
            <Text className="min-w-0 flex-1 font-sans-semibold text-xs text-brand-navy">
              Leitura da tela · toque nos ícones de som
            </Text>
            <Pressable
              onPress={() => void reader.speakScreen()}
              accessibilityLabel="Ouvir tudo desta tela"
              className="h-8 w-8 items-center justify-center rounded-full bg-primary-light active:opacity-80"
            >
              <Volume2 color="#1c756a" size={16} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => setScreenExplorerMode(false)}
              accessibilityLabel="Desativar leitura da tela"
              className="h-8 w-8 items-center justify-center rounded-full active:bg-primary-light/40"
            >
              <X color="#5a7282" size={16} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: Math.max(insets.bottom, 12) + 68,
          right: 16,
          zIndex: 40,
          elevation: 40,
        }}
      >
        <AccessibilityTrigger />
      </View>

      <AccessibilityToolbar />
    </>
  )
}
