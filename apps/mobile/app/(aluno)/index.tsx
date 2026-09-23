import { ScrollView, Text } from 'react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import { LinearGradient } from 'expo-linear-gradient'
import { PLATFORM_GRADIENT, PLATFORM_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { TabScreenShell } from '@/components/layout/TabScreenShell'
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
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()
  const { data: progress } = useAlunoProgress(profile?.id)
  const { data: minhaObra, isLoading: obraLoading } = useMinhaObra(profile?.id)
  const firstName = profile?.nome?.split(' ')[0] ?? 'leitor'
  const tabPadding = 72 + Math.max(insets.bottom, 12)
  const subtitulo = progress ? mensagemAcolhedora(progress) : 'Sua jornada de leitura começa aqui.'

  const greetingLabel = `${getTimeGreeting()}, ${firstName}. ${subtitulo}`

  return (
    <A11yScreen>
      <TabScreenShell>
        <LinearGradient
          colors={[...PLATFORM_GRADIENT]}
          locations={[...PLATFORM_GRADIENT_LOCATIONS]}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: tabPadding,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Speakable
              label={greetingLabel}
              style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
              className="mb-5"
            >
              <Text className="font-sans-bold text-2xl text-brand-navy">
                {getTimeGreeting()}, {firstName}
              </Text>
              <Text className="mt-3 rounded-2xl bg-white/80 px-4 py-3.5 font-sans text-sm leading-relaxed text-text-muted">
                {subtitulo}
              </Text>
            </Speakable>

          <HomeProgressCard userId={profile?.id} />
          <ContinueReadingSection userId={profile?.id} />
          <MinhaObraCard obra={minhaObra ?? null} isLoading={obraLoading} />
          <ObrasSectionRail />
          <ContentSectionRail section={HOME_SECTIONS[0]!} />

          {CATALOG_SECTIONS.map((section) => (
            <ContentSectionRail key={section.id} section={section} />
          ))}
          </ScrollView>
        </LinearGradient>
      </TabScreenShell>
    </A11yScreen>
  )
}
