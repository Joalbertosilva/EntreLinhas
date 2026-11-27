import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { ScreenPageHeader } from '@/components/layout/ScreenPageHeader'
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
import { HOME_HERO_PANEL_MIN_HEIGHT, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useAuth } from '@/providers/AuthProvider'

const CATALOG_SECTIONS = HOME_SECTIONS.filter((section) => section.id !== 'destaques')

export default function HomeScreen() {
  const [isHomeFocused, setIsHomeFocused] = useState(true)
  useFocusEffect(
    useCallback(() => {
      setIsHomeFocused(true)
      return () => setIsHomeFocused(false)
    }, []),
  )
  const { profile } = useAuth()
  const { data: progress, isLoading: progressLoading, isPending: progressPending } = useAlunoProgress(profile?.id)
  const { data: minhaObra, isLoading: obraLoading } = useMinhaObra(profile?.id)
  const showProgressPlaceholder = Boolean(profile?.id) && progressPending && !progress
  const firstName = profile?.nome?.split(' ')[0] ?? 'leitor'
  const deck =
    'Leia obras da comunidade, escreva a sua e acompanhe sua jornada — tudo num só lugar.'
  const personalLine = progress ? mensagemAcolhedora(progress) : null
  const greeting = getTimeGreeting()

  return (
    <A11yScreen>
      <TabScreenShell>
        <TabScrollView restoreScrollAfterStack>
          <ScreenPageHeader
            eyebrow="Início"
            title={`${greeting}, ${firstName}`}
            description={deck}
            variant="panel"
          >
            <View className="mt-4" style={{ minHeight: profile?.id ? 52 : 0 }}>
              {personalLine ? (
                <Text className="rounded-xl bg-primary-light/60 px-4 py-3 font-sans text-sm leading-relaxed text-text-muted">
                  {personalLine}
                </Text>
              ) : progressLoading && !progress && profile?.id ? (
                <View className="rounded-xl bg-primary-light/40" style={{ minHeight: 52 }} />
              ) : null}
            </View>
          </ScreenPageHeader>

          <View
            style={{
              paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
              minHeight: HOME_HERO_PANEL_MIN_HEIGHT * 2 + 24,
            }}
            className="mb-10 gap-6"
            collapsable={false}
          >
            <MinhaObraCard
              userId={profile?.id}
              autorNome={profile?.nome}
              obra={minhaObra ?? null}
              isLoading={obraLoading && !minhaObra}
              embedded
            />
            <HomeProgressCard
              progress={progress}
              showProgressPlaceholder={showProgressPlaceholder}
              embedded
            />
          </View>

          <View collapsable={false}>
            <ContinueReadingSection userId={profile?.id} />
            <ObrasSectionRail />
            <ContentSectionRail section={HOME_SECTIONS[0]!} />

            {CATALOG_SECTIONS.map((section, index) => (
              <View key={section.id} collapsable={false}>
                <ContentSectionRail section={section} />
                <CatalogVideoStrip
                  section={section}
                  isLastOnHome={index === CATALOG_SECTIONS.length - 1}
                  motionEnabled={isHomeFocused}
                />
              </View>
            ))}
          </View>
        </TabScrollView>
      </TabScreenShell>
    </A11yScreen>
  )
}
