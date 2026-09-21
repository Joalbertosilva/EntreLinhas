import { FlatList, Text, View } from 'react-native'
import type { HomeSectionConfig } from '@/features/conteudos/homeSections'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { useSectionConteudos } from '@/features/conteudos/useConteudos'

interface ContentSectionRailProps {
  section: HomeSectionConfig
}

function SectionSkeleton() {
  return (
    <View className="flex-row gap-3 px-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} className="w-[140px]">
          <View className="aspect-[3/4] rounded-xl bg-primary/10" />
          <View className="mt-2.5 h-4 rounded bg-primary/10" />
        </View>
      ))}
    </View>
  )
}

export function ContentSectionRail({ section }: ContentSectionRailProps) {
  const { data, isLoading, isError } = useSectionConteudos(section)

  return (
    <View className="mb-8">
      <View className="mb-3 px-5">
        <Text className="font-sans-bold text-lg text-brand-navy">{section.title}</Text>
        {section.subtitle ? (
          <Text className="mt-0.5 font-sans text-sm text-text-muted">{section.subtitle}</Text>
        ) : null}
      </View>

      {isLoading ? (
        <SectionSkeleton />
      ) : isError ? (
        <Text className="px-5 font-sans text-sm text-error">
          Não foi possível carregar esta seção.
        </Text>
      ) : !data?.length ? (
        <Text className="px-5 font-sans text-sm text-text-muted">
          Nenhum conteúdo disponível por enquanto.
        </Text>
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          renderItem={({ item }) => <ContentCard conteudo={item} />}
        />
      )}
    </View>
  )
}
