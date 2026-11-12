import { Linking, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight, Info } from 'lucide-react-native'
import { PLATFORM_APP_VERSION, PLATFORM_SUPPORT_EMAIL } from '@/lib/platformCredits'

export function PlatformInfoSection() {
  const router = useRouter()

  const openSupport = () => {
    void Linking.openURL(`mailto:${PLATFORM_SUPPORT_EMAIL}`)
  }

  return (
    <View className="mt-7">
      <Text className="mb-2.5 font-sans-semibold text-[11px] uppercase tracking-wider text-text-muted">
        Informações
      </Text>
      <View className="overflow-hidden rounded-2xl border border-border/80 bg-white">
        <Pressable
          onPress={() => router.push('/(aluno)/sobre')}
          accessibilityRole="button"
          accessibilityLabel="Sobre o aplicativo"
          className="flex-row items-center justify-between border-b border-border/60 px-4 py-3.5 active:bg-primary-light/15"
        >
          <View className="flex-row items-center gap-2.5">
            <Info color="#1c756a" size={18} strokeWidth={2} />
            <Text className="font-sans-semibold text-sm text-brand-navy">Sobre o aplicativo</Text>
          </View>
          <ChevronRight color="#94a3b8" size={16} />
        </Pressable>

        <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border/60">
          <Text className="font-sans-medium text-sm text-text-muted">Versão</Text>
          <Text className="font-sans-semibold text-sm text-text">{PLATFORM_APP_VERSION}</Text>
        </View>

        <Pressable
          onPress={openSupport}
          accessibilityRole="link"
          className="flex-row items-center justify-between px-4 py-3.5 active:bg-primary-light/15"
        >
          <Text className="font-sans-medium text-sm text-text-muted">Suporte</Text>
          <Text className="max-w-[58%] text-right font-sans-semibold text-sm text-primary">
            {PLATFORM_SUPPORT_EMAIL}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
