import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { PenLine } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import type { MinhaObraResumo } from '@/features/obras/useMinhaObra'
import { capaImageUri, resolvePublicImageUri } from '@/lib/imageUrl'
import { HOME_HERO_PANEL_MIN_HEIGHT, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

const DEFAULT_OBRA_COVER = resolvePublicImageUri('/images/minha-obra-default-cover.png')

interface MinhaObraCardProps {
  obra: MinhaObraResumo | null
  isLoading?: boolean
  embedded?: boolean
}

export function MinhaObraCard({ obra, isLoading, embedded = false }: MinhaObraCardProps) {
  const router = useRouter()

  const hasProducao = Boolean(obra?.ultimaProducao)
  const panelTitle = hasProducao ? 'Continue sua obra' : 'Comece sua obra'
  const titulo = obra?.titulo ?? 'Minha obra'
  const subtitulo = hasProducao
    ? `Última produção: ${obra!.ultimaProducao!.titulo}`
    : 'Livro, crônica ou poema — seu espaço de escrita.'

  const coverUri = obra?.capa_url
    ? capaImageUri(obra.capa_url, obra.updated_at)
    : DEFAULT_OBRA_COVER

  if (isLoading) {
    return (
      <View style={{ marginHorizontal: embedded ? 0 : SCREEN_HORIZONTAL_PADDING }}>
        <Text className="mb-2.5 font-sans-bold text-[11px] uppercase tracking-wider text-primary/80">
          Minha escrita
        </Text>
        <View
          className="rounded-[20px] border border-primary/10 bg-white"
          style={{ minHeight: HOME_HERO_PANEL_MIN_HEIGHT }}
        />
      </View>
    )
  }

  return (
    <View style={{ marginHorizontal: embedded ? 0 : SCREEN_HORIZONTAL_PADDING }}>
      <Text className="mb-2.5 font-sans-bold text-[11px] uppercase tracking-wider text-primary/80">
        Minha escrita
      </Text>
      <Pressable
        onPress={() => router.push('/(aluno)/minha-obra')}
        accessibilityRole="button"
        accessibilityLabel={`${panelTitle}. ${titulo}. ${subtitulo}`}
        className="overflow-hidden rounded-[20px] border border-primary/15 bg-white active:opacity-95"
        style={{ minHeight: HOME_HERO_PANEL_MIN_HEIGHT, shadowColor: '#1a3342', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
      >
        <View className="flex-1 flex-row gap-4 px-5 py-5">
          <View className="w-[92px] shrink-0">
            <View className="aspect-[2/3] w-full overflow-hidden rounded-xl border border-primary/12 bg-primary-light/35 shadow-sm">
              {coverUri ? (
                <Image
                  source={{ uri: coverUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center bg-accent-light/50">
                  <PenLine color="#b45309" size={22} strokeWidth={1.75} />
                </View>
              )}
              {!obra?.capa_url ? (
                <View className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5">
                  <Text className="font-sans-semibold text-[9px] uppercase tracking-wide text-primary">Sua obra</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View className="min-w-0 flex-1 justify-center pr-1">
            <Text className="font-sans-semibold text-[11px] uppercase tracking-wider text-accent-hover">
              {panelTitle}
            </Text>
            <Text className="mt-1.5 font-sans-bold text-base leading-snug text-brand-navy" numberOfLines={2}>
              {titulo}
            </Text>
            <Text className="mt-2 font-sans text-sm leading-relaxed text-text-muted" numberOfLines={3}>
              {subtitulo}
            </Text>
            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              {obra?.publicado ? (
                <Text className="rounded-full bg-primary/10 px-2.5 py-1 font-sans-semibold text-[10px] uppercase text-primary">
                  Publicada
                </Text>
              ) : (
                <Text className="rounded-full bg-surface-warm px-2.5 py-1 font-sans-medium text-[10px] text-text-muted">
                  Rascunho
                </Text>
              )}
              <Text className="font-sans-semibold text-xs text-primary">Abrir editor →</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  )
}
