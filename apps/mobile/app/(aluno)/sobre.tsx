import { Stack } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { BookOpen, PenLine, Sparkles, TrendingUp } from 'lucide-react-native'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { ScreenBackHeader } from '@/components/layout/ScreenBackHeader'
import { Speakable } from '@/features/accessibility/Speakable'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'
import { SCREEN_HORIZONTAL_PADDING, stackScrollPaddingBottom } from '@/lib/layout'
import { useStackScreenInsets } from '@/lib/useStackScreenInsets'

const SECTIONS = [
  {
    title: 'Descobrir textos',
    body: 'Livros, crônicas, poemas, músicas e vídeos pensados para adolescentes. Explore no seu ritmo.',
    icon: BookOpen,
  },
  {
    title: 'Escrever a sua história',
    body: 'Monte sua obra, escreva capítulos e publique na comunidade quando quiser.',
    icon: PenLine,
  },
  {
    title: 'Ver seu crescimento',
    body: 'Registre leituras, acompanhe XP e níveis na sua jornada de leitura.',
    icon: TrendingUp,
  },
  {
    title: 'Ler e conversar juntos',
    body: 'Conheça obras de colegas, comente e troque ideias.',
    icon: Sparkles,
  },
] as const

export default function SobreScreen() {
  const { insets, scrollPaddingBottom } = useStackScreenInsets()

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
      <A11yScreen>
        <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
          <ScreenBackHeader title="Sobre nós" />
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
              paddingBottom: scrollPaddingBottom ?? stackScrollPaddingBottom(insets),
            }}
          >
            <Speakable label={`${BRAND_NAME}. ${BRAND_TAGLINE}. ${BRAND_INSTITUTION}`}>
              <Text className="font-sans-bold text-2xl text-brand-navy">{BRAND_NAME}</Text>
              <Text className="mt-1 font-sans-semibold text-base text-primary">{BRAND_TAGLINE}</Text>
              <Text className="mt-2 font-sans text-sm text-text-muted">{BRAND_INSTITUTION}</Text>
            </Speakable>

            {SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <Speakable
                  key={section.title}
                  label={`${section.title}. ${section.body}`}
                  className="mt-6 rounded-2xl border border-border bg-white p-4"
                >
                  <View className="mb-2 flex-row items-center gap-2">
                    <Icon color="#1c756a" size={20} />
                    <Text className="font-sans-bold text-base text-brand-navy">{section.title}</Text>
                  </View>
                  <Text className="font-sans text-sm leading-relaxed text-text-muted">{section.body}</Text>
                </Speakable>
              )
            })}
          </ScrollView>
        </View>
      </A11yScreen>
    </>
  )
}
