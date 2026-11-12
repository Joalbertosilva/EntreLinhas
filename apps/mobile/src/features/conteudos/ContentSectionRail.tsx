import { useRouter } from 'expo-router'
import { FlatList, Pressable, Text, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import type { HomeSectionConfig } from '@/features/conteudos/homeSections'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { useSectionConteudos } from '@/features/conteudos/useConteudos'
import { ScreenSectionHeader } from '@/components/layout/ScreenPageHeader'
import {
  CONTENT_CARD_WIDTH,
  CONTENT_COVER_HEIGHT,
  RAIL_ITEM_GAP,
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
  const { data, isLoading, isError } = useSectionConteudos(section)
  const showVerTudo = section.id !== 'destaques'

  return (
    <View style={{ marginBottom: SECTION_GAP }}>
      <ScreenSectionHeader
        title={section.title}
        subtitle={section.subtitle}
        action={
          showVerTudo ? (
            <Pressable
              onPress={() => router.push(`/(aluno)/(tabs)/explorar?tipo=${section.tipo}`)}
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

      {isLoading ? (
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
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: RAIL_ITEM_GAP }}
          renderItem={({ item }) => <ContentCard conteudo={item} />}
        />
      )}
    </View>
  )
}
