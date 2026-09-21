import { ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BrandLogo } from '@/components/auth/BrandLogo'
import { ContentSectionRail } from '@/features/conteudos/ContentSectionRail'
import { HOME_SECTIONS } from '@/features/conteudos/homeSections'
import { useAuth } from '@/providers/AuthProvider'

const CATALOG_SECTIONS = HOME_SECTIONS.filter((section) => section.id !== 'destaques')

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()
  const firstName = profile?.nome?.split(' ')[0] ?? 'leitor'

  return (
    <LinearGradient colors={['#fafefc', '#e5f7f3', '#ffffff']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center gap-3 px-5">
          <BrandLogo variant="mark" showTagline={false} />
          <View className="flex-1">
            <Text className="font-sans-bold text-xl text-brand-navy">Olá, {firstName}</Text>
            <Text className="mt-0.5 font-sans text-sm text-text-muted">Sua jornada de leitura</Text>
          </View>
        </View>

        <ContentSectionRail section={HOME_SECTIONS[0]!} />

        {CATALOG_SECTIONS.map((section) => (
          <ContentSectionRail key={section.id} section={section} />
        ))}
      </ScrollView>
    </LinearGradient>
  )
}
