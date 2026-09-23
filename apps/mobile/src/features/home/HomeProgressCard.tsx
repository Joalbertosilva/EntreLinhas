import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ChevronRight, BookOpen } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import { rotuloNivel, tituloJornada } from '@/lib/alunoProgress'
import { paletaLivroCinematico, resumoLeituras } from '@/lib/progressCopy'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useAlunoProgress } from '@/features/progress/useAlunoProgress'

interface HomeProgressCardProps {
  userId: string | undefined
}

export function HomeProgressCard({ userId }: HomeProgressCardProps) {
  const router = useRouter()
  const { data: progress, isLoading } = useAlunoProgress(userId)

  if (isLoading) {
    return (
      <View
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mb-5 h-28 rounded-2xl bg-sky-mid"
      />
    )
  }

  if (!progress) return null

  const paleta = paletaLivroCinematico(progress.nivel, progress.progressoNivelPct)
  const resumo = resumoLeituras(progress)

  const speakLabel = `Minha jornada. ${rotuloNivel(progress.nivel, progress.nivelMaximo)}. ${tituloJornada(progress.nivel)}. ${resumo}`

  return (
    <Speakable label={speakLabel} style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-5">
    <Pressable
      onPress={() => router.push('/(aluno)/progresso')}
      accessibilityRole="button"
      accessibilityLabel="Ver minha jornada de leitura"
      className="active:opacity-95"
    >
      <LinearGradient
        colors={[paleta.ambiente, `${paleta.ambiente}dd`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, paddingHorizontal: 18, paddingVertical: 16 }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <BookOpen color="#fff" size={22} strokeWidth={1.75} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-sans-bold text-base leading-snug text-white">
              {rotuloNivel(progress.nivel, progress.nivelMaximo)}
            </Text>
            <Text className="mt-0.5 font-sans-medium text-sm text-white/90">{tituloJornada(progress.nivel)}</Text>
          </View>
          <ChevronRight color="#ffffffbb" size={18} />
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="font-sans-semibold text-sm text-white/90">{progress.xp} XP</Text>
          {!progress.nivelMaximo ? (
            <Text className="font-sans text-xs text-white/75">{progress.progressoNivelPct}% do nível</Text>
          ) : null}
        </View>

        <View className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/25">
          <View className="h-full rounded-full bg-white" style={{ width: `${progress.progressoNivelPct}%` }} />
        </View>

        {resumo !== 'Nenhuma leitura registrada ainda' ? (
          <Text className="mt-2.5 font-sans text-xs leading-relaxed text-white/80">{resumo}</Text>
        ) : null}

        <Text className="mt-2 font-sans-medium text-xs text-white/70">Ver jornada completa</Text>
      </LinearGradient>
    </Pressable>
    </Speakable>
  )
}
