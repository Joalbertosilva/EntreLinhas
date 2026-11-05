import { useRouter } from 'expo-router'
import { FlatList, Pressable, Text, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import type { HomeSectionConfig } from '@/features/conteudos/homeSections'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { useSectionConteudos } from '@/features/conteudos/useConteudos'
import { CONTENT_CARD_WIDTH, CONTENT_COVER_HEIGHT, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

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
    <View className="mb-8">
      <View
        style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mb-3 flex-row items-start justify-between gap-3"
      >
        <Speakable label={[section.title, section.subtitle].filter(Boolean).join('. ')} className="min-w-0 flex-1">
          <Text className="font-sans-bold text-lg text-brand-navy">{section.title}</Text>
          {section.subtitle ? (
            <Text className="mt-0.5 font-sans text-sm text-text-muted">{section.subtitle}</Text>
          ) : null}
        </Speakable>
        {showVerTudo ? (
          <Pressable
            onPress={() => router.push(`/(aluno)/(tabs)/explorar?tipo=${section.tipo}`)}
            className="mt-0.5 flex-row items-center gap-0.5 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={`Ver todos os ${section.title.toLowerCase()}`}
          >
            <Text className="font-sans-semibold text-xs text-primary">Ver tudo</Text>
            <ChevronRight color="#1c756a" size={16} />
          </Pressable>
        ) : null}
      </View>

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
          contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: 12 }}
          renderItem={({ item }) => <ContentCard conteudo={item} />}
        />
      )}
    </View>
  )
}
