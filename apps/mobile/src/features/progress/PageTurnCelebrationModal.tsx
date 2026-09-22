import { LinearGradient } from 'expo-linear-gradient'
import { BookOpen, Sparkles, X } from 'lucide-react-native'
import { useEffect } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { PageTurnDetail } from '@/features/progress/progressCelebration'
import { playLevelUpSound, playPageTurnSound } from '@/features/progress/playProgressSounds'
import { paletaLivroCinematico } from '@/lib/progressCopy'

interface PageTurnCelebrationModalProps {
  detail: PageTurnDetail | null
  onClose: () => void
}

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

  const title = detail.leveledUp
    ? `Capítulo ${detail.nivel}`
    : detail.status === 'concluido'
      ? 'Obra concluída'
      : 'Leitura iniciada'

  const subtitle = detail.leveledUp
    ? 'Novo capítulo desbloqueado'
    : detail.status === 'concluido'
      ? 'Mais uma obra na jornada'
      : 'Bom começo'

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
            <X color="rgba(255,255,255,0.9)" size={16} />
          </Pressable>

          <View className="flex-row items-center gap-4 pr-6">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15">
              {detail.leveledUp ? (
                <Sparkles color="#ffffff" size={28} strokeWidth={1.75} />
              ) : (
                <BookOpen color="#ffffff" size={28} strokeWidth={1.75} />
              )}
            </View>

            <View className="min-w-0 flex-1">
              <Text className="font-sans-bold text-base text-white">{title}</Text>
              <Text className="mt-1 font-sans text-sm text-white/88">{subtitle}</Text>
              {detail.xpGained > 0 ? (
                <View className="mt-2 self-start rounded-full border border-white/35 bg-white/20 px-2.5 py-1">
                  <Text className="font-sans-semibold text-xs text-white">+{detail.xpGained} XP</Text>
                </View>
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  )
}
