import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ChevronRight, PenLine } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import type { MinhaObraResumo } from '@/features/obras/useMinhaObra'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

interface MinhaObraCardProps {
  obra: MinhaObraResumo | null
  isLoading?: boolean
}

export function MinhaObraCard({ obra, isLoading }: MinhaObraCardProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <View
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mb-5 h-28 rounded-3xl bg-primary/10"
      />
    )
  }

  const hasProducao = Boolean(obra?.ultimaProducao)
  const titulo = obra?.titulo ?? 'Minha obra'
  const subtitulo = hasProducao
    ? `Último: ${obra!.ultimaProducao!.titulo}`
    : 'Comece a escrever sua história'

  return (
    <Pressable
      onPress={() => router.push('/(aluno)/minha-obra')}
      accessibilityRole="button"
      accessibilityLabel="Abrir editor da minha obra"
      style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
      className="mb-5 overflow-hidden rounded-3xl active:opacity-95"
    >
      <LinearGradient
        colors={['#fef6e4', '#fff8ee', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="border border-accent/20 p-4"
      >
        <View className="flex-row gap-3">
          <View className="h-[76px] w-14 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
            {obra?.capa_url ? (
              <Image source={{ uri: obra.capa_url }} style={{ width: 56, height: 76 }} contentFit="cover" />
            ) : (
              <View className="flex-1 items-center justify-center bg-accent-light/50">
                <PenLine color="#b45309" size={20} />
              </View>
            )}
          </View>
          <View className="min-w-0 flex-1 justify-center">
            <Text className="font-sans-semibold text-[10px] uppercase tracking-wider text-accent-hover">
              {hasProducao ? 'Continue sua obra' : 'Comece sua obra'}
            </Text>
            <Text className="mt-0.5 font-sans-bold text-base text-brand-navy" numberOfLines={1}>
              {titulo}
            </Text>
            <Text className="mt-0.5 font-sans text-sm text-text-muted" numberOfLines={2}>
              {subtitulo}
            </Text>
            <View className="mt-2 flex-row flex-wrap items-center gap-2">
              {obra?.publicado ? (
                <Text className="rounded-full bg-primary/10 px-2 py-0.5 font-sans-semibold text-[10px] uppercase text-primary">
                  Publicada
                </Text>
              ) : (
                <Text className="rounded-full bg-white px-2 py-0.5 font-sans-medium text-[10px] text-text-muted">
                  Rascunho
                </Text>
              )}
            </View>
          </View>
          <View className="justify-center">
            <ChevronRight color="#b45309" size={20} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  )
}
