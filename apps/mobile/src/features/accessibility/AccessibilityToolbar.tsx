import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { Accessibility, RotateCcw, Volume2, VolumeX, X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useScreenReader } from '@/features/accessibility/useScreenReader'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export function AccessibilityTrigger() {
  const { setModeEnabled } = useAccessibility()

  return (
    <Pressable
      onPress={() => setModeEnabled(true)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Abrir ferramentas de acessibilidade"
      className="h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-white shadow-md"
    >
      <Accessibility color="#1c756a" size={20} strokeWidth={1.75} />
    </Pressable>
  )
}

export function AccessibilityToolbar() {
  const insets = useSafeAreaInsets()
  const {
    modeEnabled,
    setModeEnabled,
    screenExplorerMode,
    setScreenExplorerMode,
    fontScale,
    fontScalePercent,
    increaseFont,
    decreaseFont,
    resetFont,
    audioEnabled,
    setAudioEnabled,
  } = useAccessibility()

  const reader = useScreenReader()

  return (
    <Modal visible={modeEnabled} animationType="slide" transparent onRequestClose={() => setModeEnabled(false)}>
      <Pressable className="flex-1 justify-end bg-black/30" onPress={() => setModeEnabled(false)}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="max-h-[90%] rounded-t-3xl border border-primary/15 bg-white px-6 pt-5"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-5 flex-row items-center justify-between">
              <View className="min-w-0 flex-1 pr-3">
                <Text className="font-sans-bold text-lg text-brand-navy">Acessibilidade</Text>
                <Text className="mt-0.5 font-sans text-sm text-text-muted">
                  Texto maior e leitura em voz alta
                </Text>
              </View>
              <Pressable onPress={() => setModeEnabled(false)} accessibilityLabel="Fechar" className="rounded-full p-2">
                <X color="#5a7282" size={20} />
              </Pressable>
            </View>

            <Text className="font-sans-semibold text-sm text-brand-navy">Tamanho do texto</Text>
            <Text className="mt-1 font-sans text-xs text-text-muted">
              Aplica em todo o app: home, menus, leitura, reflexões e abas.
            </Text>
            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              <Button
                variant="outline"
                label="A-"
                onPress={decreaseFont}
                disabled={fontScale === 'normal'}
                className="min-w-[72px]"
              />
              <Text className="min-w-[48px] text-center font-sans-bold text-base text-text">{fontScalePercent}%</Text>
              <Button
                variant="outline"
                label="A+"
                onPress={increaseFont}
                disabled={fontScale === 'xxlarge'}
                className="min-w-[72px]"
              />
              <Pressable
                onPress={resetFont}
                accessibilityRole="button"
                className="flex-row items-center gap-1 rounded-xl border border-border px-3 py-2"
              >
                <RotateCcw size={16} color="#5a7282" />
                <Text className="font-sans-medium text-sm text-text-muted">Padrão</Text>
              </Pressable>
            </View>

            <View className="mt-6 border-t border-border/60 pt-5">
              <Text className="font-sans-semibold text-sm text-brand-navy">Áudio e leitura</Text>
              <Text className="mt-1 font-sans text-sm leading-relaxed text-text-muted">
                Ative a leitura da tela para ouvir cada card e seção, ou ouça um trecho selecionado
                no livro.
              </Text>
              <View className="mt-3 flex-row gap-2">
                <AudioChoice
                  active={audioEnabled === true}
                  label="Sim, prefiro áudio"
                  icon={Volume2}
                  onPress={() => setAudioEnabled(true)}
                />
                <AudioChoice
                  active={audioEnabled === false}
                  label="Só texto"
                  icon={VolumeX}
                  onPress={() => setAudioEnabled(false)}
                />
              </View>

              <View className="mt-4 gap-2">
                <Button
                  variant={screenExplorerMode ? 'primary' : 'outline'}
                  label={screenExplorerMode ? 'Leitura da tela ativa' : 'Ativar leitura da tela'}
                  onPress={() => {
                    setScreenExplorerMode(true)
                    setModeEnabled(false)
                  }}
                />
                <Button
                  variant="outline"
                  label={reader.isSpeaking ? 'Parar leitura' : 'Ouvir tudo desta tela'}
                  onPress={() => {
                    if (reader.isSpeaking) {
                      void reader.stopSpeech()
                      return
                    }
                    setScreenExplorerMode(true)
                    setModeEnabled(false)
                    requestAnimationFrame(() => {
                      setTimeout(() => void reader.speakScreen(), 500)
                    })
                  }}
                />
                <Button variant="outline" label="Ouvir seleção" onPress={() => void reader.speakSelection()} />
                {screenExplorerMode ? (
                  <Button
                    variant="ghost"
                    label="Desativar leitura da tela"
                    onPress={() => setScreenExplorerMode(false)}
                  />
                ) : null}
                <Text className="font-sans text-xs leading-relaxed text-text-muted">
                  Com a leitura da tela ativa, cada card e seção ganha um ícone de som. Toque nele para
                  ouvir o que é (livro, poema, seção…). Ou use Ouvir tudo para ler a tela inteira.
                </Text>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function AudioChoice({
  active,
  label,
  icon: Icon,
  onPress,
}: {
  active: boolean
  label: string
  icon: typeof Volume2
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-xl border px-3 py-3',
        active ? 'border-primary bg-primary-light' : 'border-border bg-white',
      )}
    >
      <Icon color={active ? '#1c756a' : '#5a7282'} size={18} strokeWidth={1.75} />
      <Text className={cn('font-sans-semibold text-xs', active ? 'text-primary' : 'text-text-muted')}>{label}</Text>
    </Pressable>
  )
}
