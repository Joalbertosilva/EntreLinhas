import { Image, Linking, Pressable, Text, View } from 'react-native'
import {
  PLATFORM_APP_VERSION,
  PLATFORM_CREDITS,
  PLATFORM_SUPPORT_EMAIL,
} from '@/lib/platformCredits'

function CreditNames({ names }: { names: readonly string[] }) {
  if (names.length === 0) {
    return <Text className="font-sans text-sm text-text-muted">—</Text>
  }
  return (
    <Text className="font-sans text-sm leading-relaxed text-text">
      {names.join(', ')}
    </Text>
  )
}

export function PlatformCreditsCard() {
  const openSupport = () => {
    void Linking.openURL(`mailto:${PLATFORM_SUPPORT_EMAIL}`)
  }

  return (
    <View className="mt-6 rounded-2xl border border-border/80 bg-white p-4">
      <Text className="font-sans-bold text-base text-brand-navy">Créditos</Text>

      <Text className="mt-4 font-sans-semibold text-xs uppercase tracking-wide text-text-muted">
        Desenvolvido por
      </Text>
      <View className="mt-2 flex-row flex-wrap items-center gap-4">
        <Image
          source={require('../../../assets/images/cesmac-citec-logo.png')}
          className="h-16 w-16"
          resizeMode="contain"
          accessibilityLabel="CESMAC CITEC"
        />
        <Image
          source={require('../../../assets/images/cesmac-centro-logo.png')}
          className="h-10 w-44"
          resizeMode="contain"
          accessibilityLabel="CESMAC Centro Universitário"
        />
      </View>

      <CreditSection
        label="Professores e pesquisadores envolvidos"
        names={PLATFORM_CREDITS.professorsResearchers}
      />
      <CreditSection label="Desenvolvedores responsáveis" names={PLATFORM_CREDITS.developers} />
      <CreditSection label="Designers" names={PLATFORM_CREDITS.designers} />
      <CreditSection label="Colaboração" names={PLATFORM_CREDITS.collaboration} />

      <View className="mt-4 border-t border-border/60 pt-3">
        <View className="flex-row items-center justify-between py-1.5">
          <Text className="font-sans-semibold text-sm text-text-muted">Versão</Text>
          <Text className="font-sans-medium text-sm text-text">{PLATFORM_APP_VERSION}</Text>
        </View>
        <View className="flex-row items-center justify-between py-1.5">
          <Text className="font-sans-semibold text-sm text-text-muted">Suporte</Text>
          <Pressable onPress={openSupport} accessibilityRole="link">
            <Text className="font-sans-medium text-sm text-primary">{PLATFORM_SUPPORT_EMAIL}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function CreditSection({ label, names }: { label: string; names: readonly string[] }) {
  return (
    <View className="mt-4">
      <Text className="font-sans-semibold text-xs text-text-muted">{label}</Text>
      <CreditNames names={names} />
    </View>
  )
}
