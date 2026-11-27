import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { HorizontalSectionScroll } from '@/components/layout/HorizontalSectionScroll'
import { ChevronRight } from 'lucide-react-native'
import type { HomeSectionConfig } from '@/features/conteudos/homeSections'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { useSectionConteudos } from '@/features/conteudos/useConteudos'
import { ScreenSectionHeader } from '@/components/layout/ScreenPageHeader'
import {
  CONTENT_CARD_WIDTH,
  CONTENT_COVER_HEIGHT,
  SCREEN_HORIZONTAL_PADDING,
  SECTION_GAP,
} from '@/lib/layout'

interface ContentSectionRailProps {
  section: HomeSectionConfig
}

function SectionSkeleton() {
  return (
    <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="flex-row gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={{ width: CONTENT_CARD_WIDTH }}>
          <View style={{ height: CONTENT_COVER_HEIGHT }} className="rounded-xl bg-primary/10" />
          <View className="mt-2.5 h-4 rounded bg-primary/10" />
        </View>
      ))}
    </View>
  )
}

export function ContentSectionRail({ section }: ContentSectionRailProps) {
  const router = useRouter()
  const { data, isLoading, isError, isFetched } = useSectionConteudos(section)
  const showSkeleton = isLoading && !isFetched
  const showVerTudo = section.id !== 'destaques'

  return (
    <View style={{ marginBottom: SECTION_GAP }}>
      <ScreenSectionHeader
        title={section.title}
        subtitle={section.subtitle}
        action={
          showVerTudo ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(aluno)/(tabs)/explorar',
                  params: { tipo: section.tipo },
                })
              }
              className="-mb-0.5 flex-row items-center gap-0.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel={`Ver todos os ${section.title.toLowerCase()}`}
            >
              <Text className="font-sans-semibold text-sm text-text-muted">Ver tudo</Text>
              <ChevronRight color="#5a7282" size={16} />
            </Pressable>
          ) : null
        }
      />

      {showSkeleton ? (
        <SectionSkeleton />
      ) : isError ? (
        <Text style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="font-sans text-sm text-error">
          Não foi possível carregar esta seção.
        </Text>
      ) : !data?.length ? (
        <Text style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="font-sans text-sm text-text-muted">
          Nenhum conteúdo disponível por enquanto.
        </Text>
      ) : (
        <HorizontalSectionScroll minHeight={CONTENT_COVER_HEIGHT + 44}>
          {data.map((item) => (
            <ContentCard key={item.id} conteudo={item} />
          ))}
        </HorizontalSectionScroll>
      )}
    </View>
  )
}
