import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { BookOpen, LineChart } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { ReaderProfileAvatar } from '@/features/app/ReaderProfileAvatar'
import { Speakable } from '@/features/accessibility/Speakable'
import {
  JOURNEY_BTN_JORNADA,
  JOURNEY_BTN_OBRAS,
  JOURNEY_XP_GRADIENT,
} from '@/lib/brandTheme'
import type { AlunoProgressStats } from '@/lib/alunoProgress'
import { HOME_HERO_PANEL_MIN_HEIGHT, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useAuth } from '@/providers/AuthProvider'

interface HomeProgressCardProps {
  progress: AlunoProgressStats | null | undefined
  showProgressPlaceholder?: boolean
  embedded?: boolean
}

export function HomeProgressCard({
  progress,
  showProgressPlaceholder = false,
  embedded = false,
}: HomeProgressCardProps) {
  const router = useRouter()
  const { profile } = useAuth()

  if (showProgressPlaceholder || !profile) {
    return (
      <View style={{ marginHorizontal: embedded ? 0 : SCREEN_HORIZONTAL_PADDING }}>
        <View
          className="rounded-[20px] border border-primary/15 bg-primary-light/25"
          style={{ minHeight: HOME_HERO_PANEL_MIN_HEIGHT }}
        />
      </View>
    )
  }

  if (!progress) {
    if (!embedded) return null
    return (
      <View style={{ marginHorizontal: 0 }}>
        <View
          className="rounded-[20px] border border-primary/15 bg-primary-light/20"
          style={{ minHeight: HOME_HERO_PANEL_MIN_HEIGHT }}
        />
      </View>
    )
  }

  const displayName = profile.nome
  const barPct = progress.nivelMaximo ? 100 : Math.max(0, Math.min(100, progress.progressoNivelPct))

  const journeyLabel = [
    displayName,
    `Nível ${progress.nivel}`,
    `${progress.xpNoNivel} de ${progress.xpNecessarioNivel} XP neste nível`,
    progress.nivelMaximo
      ? 'Nível máximo alcançado'
      : progress.xpParaProximoNivel > 0
        ? `Faltam ${progress.xpParaProximoNivel} XP para o nível ${progress.nivel + 1}`
        : null,
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <View style={{ marginHorizontal: embedded ? 0 : SCREEN_HORIZONTAL_PADDING }}>
      <Speakable label={journeyLabel}>
        <View
          className="overflow-hidden rounded-[20px] border border-primary/15 bg-white"
          style={{
            minHeight: HOME_HERO_PANEL_MIN_HEIGHT,
            shadowColor: '#1a3342',
            shadowOpacity: 0.06,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
          }}
          accessibilityLabel={journeyLabel}
        >
          <View className="px-5 pb-7 pt-5">
            <View className="mb-4 flex-row items-center gap-3.5">
              <ReaderProfileAvatar
                name={displayName}
                imageUrl={profile.avatar_url}
                nivel={progress.nivel}
                editable
              />
              <Text
                className="min-w-0 flex-1 font-sans-bold text-[17px] leading-snug text-brand-navy"
                numberOfLines={2}
              >
                {displayName}
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="h-[11px] min-w-0 flex-1 overflow-hidden rounded-full border border-primary/15 bg-[#e8eef0]">
                <LinearGradient
                  colors={[...JOURNEY_XP_GRADIENT]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ width: `${barPct}%`, height: '100%', borderRadius: 999 }}
                />
              </View>
              <Text className="shrink-0 font-sans-semibold text-[13px] text-text-muted">
                {progress.xpNoNivel} / {progress.xpNecessarioNivel} xp
              </Text>
            </View>

            {progress.nivelMaximo ? (
              <Text className="mt-2.5 font-sans text-[13px] text-text-muted">Nível máximo alcançado</Text>
            ) : progress.xpParaProximoNivel > 0 ? (
              <Text className="mt-2.5 font-sans text-[13px] leading-relaxed text-text-muted">
                Faltam {progress.xpParaProximoNivel} XP para o nível {progress.nivel + 1}
              </Text>
            ) : null}

            <View className="mt-5 flex-row gap-2.5">
              <Pressable
                onPress={() => router.push('/(aluno)/progresso')}
                className="min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-full py-3.5 active:opacity-90"
                style={{ backgroundColor: JOURNEY_BTN_JORNADA }}
                accessibilityRole="button"
                accessibilityLabel="Minha jornada"
              >
                <LineChart color="#ffffff" size={16} strokeWidth={2} />
                <Text className="font-sans-bold text-[13px] text-white">Minha jornada</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(aluno)/minha-obra')}
                className="min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-full py-3.5 active:opacity-90"
                style={{ backgroundColor: JOURNEY_BTN_OBRAS }}
                accessibilityRole="button"
                accessibilityLabel="Minhas obras"
              >
                <BookOpen color="#ffffff" size={16} strokeWidth={2} />
                <Text className="font-sans-bold text-[13px] text-white">Minhas obras</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Speakable>
    </View>
  )
}
