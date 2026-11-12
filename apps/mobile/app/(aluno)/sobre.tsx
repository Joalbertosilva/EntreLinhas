import { Stack } from 'expo-router'
import { Image, ScrollView, Text, View } from 'react-native'
import { BookOpen, PenLine, Sparkles, TrendingUp } from 'lucide-react-native'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { PlatformBackground } from '@/components/layout/PlatformBackground'
import { ScreenBackHeader } from '@/components/layout/ScreenBackHeader'
import { Speakable } from '@/features/accessibility/Speakable'
import { PlatformCreditsCard } from '@/features/about/PlatformCreditsCard'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useStackScreenInsets } from '@/lib/useStackScreenInsets'

const SECTIONS = [
  {
    kicker: 'Leitura',
    title: 'Descobrir textos',
    body: 'Livros, crônicas, poemas e músicas pensados para adolescentes. Você explora no seu ritmo, vai se interessando por histórias que fazem sentido e constrói o hábito de ler aos poucos.',
    icon: BookOpen,
  },
  {
    kicker: 'Minha obra',
    title: 'Escrever a sua história',
    body: 'O que você lê pode virar inspiração. Escreva do seu jeito, no seu tempo, e monte uma obra que seja sua. Quando quiser, mostre para a turma.',
    icon: PenLine,
  },
  {
    kicker: 'Sua jornada',
    title: 'Ver seu crescimento',
    body: 'Registre o que leu, anote o que pensou e acompanhe como você evolui. Cada leitura conta e ajuda no seu desenvolvimento como leitor.',
    icon: TrendingUp,
  },
  {
    kicker: 'Comunidade',
    title: 'Ler e conversar juntos',
    body: 'Conheça o que colegas escreveram, comente e troque ideias. Ler junto também faz parte do caminho.',
    icon: Sparkles,
  },
] as const

export default function SobreScreen() {
  const { insets, scrollPaddingBottom } = useStackScreenInsets()

  const deck = `O ${BRAND_NAME} existe para aproximar adolescentes da leitura, despertar curiosidade por novos textos e apoiar quem quer crescer lendo e escrevendo. Projeto de TCC da ${BRAND_INSTITUTION}.`

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
      <A11yScreen>
        <PlatformBackground style={{ paddingTop: insets.top }}>
          <ScreenBackHeader title="Sobre o aplicativo" subtitle="Como funciona cada parte do app" />
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
              paddingTop: 8,
              paddingBottom: scrollPaddingBottom,
            }}
          >
            <View className="overflow-hidden rounded-2xl border border-primary/15 bg-white px-5 py-6">
              <Image
                source={require('../../assets/images/entrelinhas-logo.png')}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
                accessibilityLabel={BRAND_NAME}
              />
              <Text className="mt-4 font-sans-semibold text-[11px] uppercase tracking-wider text-primary">
                Sobre o aplicativo
              </Text>
              <Speakable label={`${BRAND_NAME}. ${BRAND_TAGLINE}. ${deck}`}>
                <Text className="mt-2 font-sans-bold text-2xl text-brand-navy">{BRAND_NAME}</Text>
                <Text className="mt-1 font-sans-semibold text-base text-primary">{BRAND_TAGLINE}</Text>
                <Text className="mt-3 font-sans text-sm leading-relaxed text-text-muted">{deck}</Text>
              </Speakable>
            </View>

            {SECTIONS.map((section, index) => {
              const Icon = section.icon
              return (
                <Speakable
                  key={section.title}
                  label={`${section.title}. ${section.body}`}
                  className="mt-4 overflow-hidden rounded-2xl border border-border/80 bg-white p-4"
                >
                  <Text className="font-sans-semibold text-[10px] uppercase tracking-wider text-primary/80">
                    {section.kicker}
                  </Text>
                  <View className="mb-2 mt-2 flex-row items-center gap-2">
                    <Icon color="#1c756a" size={20} />
                    <Text className="font-sans-bold text-base text-brand-navy">{section.title}</Text>
                  </View>
                  <Text className="font-sans text-sm leading-relaxed text-text-muted">{section.body}</Text>
                  <Text className="mt-3 self-end font-sans-bold text-xs text-primary/30" accessibilityElementsHidden>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </Speakable>
              )
            })}

            <PlatformCreditsCard />
          </ScrollView>
        </PlatformBackground>
      </A11yScreen>
    </>
  )
}
