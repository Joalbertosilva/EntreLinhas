import { LinearGradient } from 'expo-linear-gradient'
import { Sparkles, TrendingUp, X } from 'lucide-react-native'
import { useEffect } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { PageTurnDetail } from '@/features/progress/progressCelebration'
import { playLevelUpSound, playPageTurnSound } from '@/features/progress/playProgressSounds'
import { tituloJornada } from '@/lib/alunoProgress'
import { paletaLivroCinematico } from '@/lib/progressCopy'

interface PageTurnCelebrationModalProps {
  detail: PageTurnDetail | null
  onClose: () => void
}

const TEXT_WHITE = '#ffffff'
const TEXT_WHITE_SOFT = 'rgba(255,255,255,0.92)'

export function PageTurnCelebrationModal({ detail, onClose }: PageTurnCelebrationModalProps) {
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!detail) return
    if (detail.leveledUp) {
      void playLevelUpSound()
    } else {
      void playPageTurnSound()
    }
  }, [detail])

  if (!detail) return null

  const paleta = paletaLivroCinematico(detail.nivel, detail.leveledUp ? 100 : 72)

  const jornadaTitulo = tituloJornada(detail.nivel)

  const title = detail.leveledUp
    ? `Nível ${detail.nivel}`
    : detail.status === 'concluido'
      ? 'Leitura concluída'
      : 'Leitura iniciada'

  const subtitle = detail.leveledUp
    ? jornadaTitulo
    : detail.status === 'concluido'
      ? 'Mais uma obra na sua jornada'
      : 'Bom começo de leitura'

  const kicker = detail.leveledUp ? 'Parabéns!' : null

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-start bg-black/35 px-4" style={{ paddingTop: insets.top + 12 }}>
        <LinearGradient
          colors={[paleta.ambiente, `${paleta.ambiente}ee`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            className="absolute right-3 top-3 z-10 rounded-full p-1.5"
          >
            <X color={TEXT_WHITE} size={16} />
          </Pressable>

          <View className="flex-row items-center gap-4 pr-6">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15">
              {detail.leveledUp ? (
                <Sparkles color={TEXT_WHITE} size={28} strokeWidth={1.75} />
              ) : (
                <TrendingUp color={TEXT_WHITE} size={28} strokeWidth={1.75} />
              )}
            </View>

            <View className="min-w-0 flex-1">
              {kicker ? (
                <Text className="font-sans-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_WHITE_SOFT }}>
                  {kicker}
                </Text>
              ) : null}
              <Text
                className={`font-sans-bold ${detail.leveledUp ? 'text-2xl' : 'text-base'}`}
                style={{ color: TEXT_WHITE, marginTop: kicker ? 4 : 0 }}
              >
                {title}
              </Text>
              <Text
                className={`font-sans-semibold ${detail.leveledUp ? 'text-base' : 'text-sm'} mt-1`}
                style={{ color: TEXT_WHITE }}
              >
                {subtitle}
              </Text>
              {detail.leveledUp ? (
                <Text className="mt-1.5 font-sans text-sm" style={{ color: TEXT_WHITE_SOFT }}>
                  Continue lendo para evoluir na jornada.
                </Text>
              ) : null}
              {detail.xpGained > 0 ? (
                <View className="mt-2.5 self-start rounded-full border border-white/35 bg-white/20 px-3 py-1">
                  <Text className="font-sans-bold text-xs" style={{ color: TEXT_WHITE }}>
                    +{detail.xpGained} XP
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  )
}
