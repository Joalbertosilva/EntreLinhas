import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Play } from 'lucide-react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import type { HomeSectionConfig } from '@/features/conteudos/homeSections'
import { useVideosByCatalogAnchor } from '@/features/conteudos/useConteudos'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { openVideoExternal } from '@/lib/openVideoUrl'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

interface CatalogVideoStripProps {
  section: HomeSectionConfig
}

/** Vídeos vinculados ao catálogo (mesma lógica da web). */
export function CatalogVideoStrip({ section }: CatalogVideoStripProps) {
  const anchor = section.catalogAnchor
  const { data: videos = [], isLoading } = useVideosByCatalogAnchor(anchor)

  if (!anchor || isLoading || videos.length === 0) return null

  const featured = videos[0]!
  const coverUrl = resolveConteudoCoverUrl(featured)

  return (
    <View className="mb-8">
      <Speakable
        label={`Vídeos sobre ${section.title}. ${featured.titulo}`}
        style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mb-3"
      >
        <Text className="font-sans-bold text-base text-brand-navy">Vídeos · {section.title}</Text>
        <Text className="mt-0.5 font-sans text-sm text-text-muted">Assistir agora</Text>
      </Speakable>

      <Pressable
        onPress={() => void openVideoExternal(featured.video_url)}
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="overflow-hidden rounded-2xl border border-primary/12 bg-white active:opacity-90"
      >
        <View className="relative aspect-video w-full bg-brand-navy/10">
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : null}
          <View className="absolute inset-0 items-center justify-center bg-brand-navy/20">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/95">
              <Play color="#1c756a" size={22} fill="#1c756a" />
            </View>
          </View>
        </View>
        <View className="px-4 py-3">
          <Text className="font-sans-semibold text-base text-text" numberOfLines={2}>
            {featured.titulo}
          </Text>
          {featured.autor ? (
            <Text className="mt-0.5 font-sans text-sm text-text-muted" numberOfLines={1}>
              {featured.autor}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  )
}
