import { Text, View, useWindowDimensions } from 'react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import { LinearGradient } from 'expo-linear-gradient'
import { PLATFORM_GRADIENT, PLATFORM_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { TabScreenShell, TabScrollView } from '@/components/layout/TabScreenShell'
import { CatalogVideoStrip } from '@/features/conteudos/CatalogVideoStrip'
import { ContentSectionRail } from '@/features/conteudos/ContentSectionRail'
import { HOME_SECTIONS } from '@/features/conteudos/homeSections'
import { ContinueReadingSection } from '@/features/home/ContinueReadingSection'
import { HomeProgressCard } from '@/features/home/HomeProgressCard'
import { MinhaObraCard } from '@/features/home/MinhaObraCard'
import { useMinhaObra } from '@/features/obras/useMinhaObra'
import { ObrasSectionRail } from '@/features/obras/ObrasSectionRail'
import { useAlunoProgress } from '@/features/progress/useAlunoProgress'
import { getTimeGreeting } from '@/lib/greeting'
import { mensagemAcolhedora } from '@/lib/progressCopy'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useAuth } from '@/providers/AuthProvider'

const CATALOG_SECTIONS = HOME_SECTIONS.filter((section) => section.id !== 'destaques')

export default function HomeScreen() {
  const { width } = useWindowDimensions()
  const stackHero = width < 380
  const { profile } = useAuth()
  const { data: progress } = useAlunoProgress(profile?.id)
  const { data: minhaObra, isLoading: obraLoading } = useMinhaObra(profile?.id)
  const firstName = profile?.nome?.split(' ')[0] ?? 'leitor'
  const deck =
    'Leia obras da comunidade, escreva a sua e acompanhe sua jornada — tudo num só lugar.'
  const personalLine = progress ? mensagemAcolhedora(progress) : null

  const greetingLabel = [
    `${getTimeGreeting()}, ${firstName}`,
    deck,
    personalLine,
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <A11yScreen>
      <TabScreenShell>
        <LinearGradient
          colors={[...PLATFORM_GRADIENT]}
          locations={[...PLATFORM_GRADIENT_LOCATIONS]}
          style={{ flex: 1 }}
        >
          <TabScrollView>
            <Speakable
              label={greetingLabel}
              style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
              className="mb-5"
            >
              <Text className="font-sans-bold text-2xl text-brand-navy">
                {getTimeGreeting()}, {firstName}
              </Text>
              <Text className="mt-2 font-sans text-sm leading-relaxed text-text-muted">{deck}</Text>
              {personalLine ? (
                <Text className="mt-2 rounded-2xl bg-white/80 px-4 py-3 font-sans text-sm leading-relaxed text-text-muted">
                  {personalLine}
                </Text>
              ) : null}
            </Speakable>

            <View
              style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
              className={stackHero ? 'mb-5 gap-4' : 'mb-5 flex-row items-stretch gap-3'}
            >
              <View className={stackHero ? 'w-full' : 'min-w-0 flex-1'}>
                <MinhaObraCard obra={minhaObra ?? null} isLoading={obraLoading} embedded />
              </View>
              <View className={stackHero ? 'w-full' : 'min-w-0 flex-1'}>
                <HomeProgressCard userId={profile?.id} embedded />
              </View>
            </View>

            <ContinueReadingSection userId={profile?.id} />
            <ObrasSectionRail />
            <ContentSectionRail section={HOME_SECTIONS[0]!} />

            {CATALOG_SECTIONS.map((section) => (
              <View key={section.id}>
                <ContentSectionRail section={section} />
                <CatalogVideoStrip section={section} />
              </View>
            ))}
          </TabScrollView>
        </LinearGradient>
      </TabScreenShell>
    </A11yScreen>
  )
}
