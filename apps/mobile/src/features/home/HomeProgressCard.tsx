import { useRouter } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { JornadaBookAvatar } from '@/features/home/JornadaBookAvatar'
import { Speakable } from '@/features/accessibility/Speakable'
import { tituloJornada } from '@/lib/alunoProgress'
import { HOME_HERO_PANEL_MIN_HEIGHT, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useAlunoProgress } from '@/features/progress/useAlunoProgress'

interface HomeProgressCardProps {
  userId: string | undefined
  embedded?: boolean
}

export function HomeProgressCard({ userId, embedded = false }: HomeProgressCardProps) {
  const router = useRouter()
  const { data: progress, isLoading } = useAlunoProgress(userId)

  if (isLoading) {
    return (
      <View style={{ marginHorizontal: embedded ? 0 : SCREEN_HORIZONTAL_PADDING }}>
        <Text className="mb-2.5 font-sans-bold text-[11px] uppercase tracking-wider text-primary/80">
          Sua jornada de leitura
        </Text>
        <View
          className="animate-pulse rounded-[20px] border border-primary/10 bg-white"
          style={{ minHeight: HOME_HERO_PANEL_MIN_HEIGHT }}
        />
      </View>
    )
  }

  if (!progress) return null

  const faixaRotulo = tituloJornada(progress.nivel)
  const journeyLabel = [
    'Sua jornada de leitura',
    `Nível ${progress.nivel}`,
    faixaRotulo,
    `${progress.xp} XP`,
    progress.nivelMaximo
      ? 'Nível máximo alcançado'
      : progress.xpParaProximoNivel > 0
        ? `Faltam ${progress.xpParaProximoNivel} XP para o nível ${progress.nivel + 1}`
        : null,
  ]
    .filter(Boolean)
    .join('. ')

  const hint = progress.nivelMaximo
    ? 'Nível máximo alcançado'
    : progress.xpParaProximoNivel > 0
      ? `Faltam ${progress.xpParaProximoNivel} XP para o nível ${progress.nivel + 1}`
      : null

  return (
    <View style={{ marginHorizontal: embedded ? 0 : SCREEN_HORIZONTAL_PADDING }}>
      <Text className="mb-2.5 font-sans-bold text-[11px] uppercase tracking-wider text-primary/80">
        Sua jornada de leitura
      </Text>
      <Speakable label={journeyLabel}>
        <Pressable
          onPress={() => router.push('/(aluno)/progresso')}
          accessibilityRole="button"
          accessibilityLabel={`${faixaRotulo}. Nível ${progress.nivel}. ${progress.xp} XP.`}
          className="overflow-hidden rounded-[20px] border border-primary/15 bg-white active:opacity-95"
          style={{ minHeight: HOME_HERO_PANEL_MIN_HEIGHT, shadowColor: '#1a3342', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
        >
          <View className="flex-1 px-5 pb-5 pt-5">
            <View className="flex-row items-center gap-3.5">
              <JornadaBookAvatar />
              <View className="min-w-0 flex-1 gap-1.5">
                <Text className="self-start rounded-full bg-primary-light px-2.5 py-0.5 font-sans-bold text-[10px] uppercase tracking-wide text-primary">
                  Nível {progress.nivel}
                </Text>
                <Text className="font-sans-bold text-[17px] leading-snug text-brand-navy">{faixaRotulo}</Text>
              </View>
            </View>

            <View className="my-3.5 h-px bg-primary/10" />

            <View className="flex-row items-end justify-between gap-3">
              <Text className="font-sans-bold text-[22px] leading-none text-brand-navy">{progress.xp} XP</Text>
              <Text className="font-sans-medium text-[13px] text-text-muted">
                {progress.xpNoNivel} / {progress.xpNecessarioNivel} XP
              </Text>
            </View>

            <View className="mt-3 h-2.5 overflow-hidden rounded-full border border-primary/15 bg-[#e8eef0]">
              <View
                className="h-full rounded-full bg-accent"
                style={{ width: `${progress.progressoNivelPct}%` }}
              />
            </View>

            {hint ? (
              <Text className="mt-2.5 font-sans text-xs leading-relaxed text-text-muted">{hint}</Text>
            ) : null}

            <View className="mt-5 flex-row items-center justify-center gap-2 rounded-full bg-brand-navy py-3">
              <Text className="font-sans-bold text-[13px] text-white">Ver minha jornada</Text>
              <ArrowRight color="#ffffff" size={16} strokeWidth={2} />
            </View>
          </View>
        </Pressable>
      </Speakable>
    </View>
  )
}
