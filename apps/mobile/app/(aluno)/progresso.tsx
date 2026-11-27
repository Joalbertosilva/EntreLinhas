import { Stack } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { BookOpen, Sparkles, Trophy } from 'lucide-react-native'
import { ReaderProfileAvatar } from '@/features/app/ReaderProfileAvatar'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { ScreenBackHeader } from '@/components/layout/ScreenBackHeader'
import { useAlunoProgress } from '@/features/progress/useAlunoProgress'
import {
  FAIXAS_NIVEL,
  XP_CONCLUIDO,
  XP_EM_ANDAMENTO,
  rotuloNivel,
  tituloJornada,
} from '@/lib/alunoProgress'
import { mensagemAcolhedora, paletaLivroCinematico, resumoLeituras } from '@/lib/progressCopy'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useStackScreenInsets } from '@/lib/useStackScreenInsets'
import { useAuth } from '@/providers/AuthProvider'

export default function ProgressoScreen() {
  const { insets, scrollPaddingBottom } = useStackScreenInsets()
  const { profile } = useAuth()
  const { data: progress, isLoading } = useAlunoProgress(profile?.id)

  const paleta = progress ? paletaLivroCinematico(progress.nivel, progress.progressoNivelPct) : null
  const displayName = profile?.nome ?? 'Leitor'

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
      <A11yScreen>
        <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
          <ScreenBackHeader title="Minha jornada" subtitle="Sua leitura, no seu tempo" />

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#1c756a" size="large" />
            </View>
          ) : !progress || !paleta ? null : (
            <ScrollView contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}>
              <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: 20 }}>
                <LinearGradient
                  colors={[paleta.ambiente, `${paleta.ambiente}dd`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 24, paddingHorizontal: 20, paddingVertical: 20 }}
                >
                  <View className="flex-row items-center gap-3.5">
                    <ReaderProfileAvatar
                      name={displayName}
                      imageUrl={profile?.avatar_url}
                      nivel={progress.nivel}
                      editable
                      size="md"
                    />
                    <View className="min-w-0 flex-1">
                      <Text className="font-sans-bold text-[17px] leading-snug text-white" numberOfLines={2}>
                        {displayName}
                      </Text>
                      <Text className="mt-1 font-sans-medium text-sm text-white/90">
                        {tituloJornada(progress.nivel)}
                      </Text>
                      <Text className="mt-0.5 font-sans-semibold text-xs text-white/80">
                        {rotuloNivel(progress.nivel, progress.nivelMaximo)}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-4 font-sans-semibold text-sm text-white/90">{progress.xp} XP total</Text>
                  <Text className="mt-2 font-sans text-sm leading-relaxed text-white/85">
                    {mensagemAcolhedora(progress)}
                  </Text>
                  <Text className="mt-1 font-sans text-xs text-white/75">{resumoLeituras(progress)}</Text>

                  <View className="mt-4 flex-row items-center gap-3">
                    <View className="h-[11px] min-w-0 flex-1 overflow-hidden rounded-full border border-primary/15 bg-[#e8eef0]">
                      <LinearGradient
                        colors={['#2a9d8f', '#3db8cf', '#5b6fd6', '#7c5fd4']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{
                          width: `${progress.nivelMaximo ? 100 : progress.progressoNivelPct}%`,
                          height: '100%',
                          borderRadius: 999,
                        }}
                      />
                    </View>
                    <Text className="shrink-0 font-sans-semibold text-[13px] text-white/90">
                      {progress.xpNoNivel} / {progress.xpNecessarioNivel} xp
                    </Text>
                  </View>
                  {progress.nivelMaximo ? (
                    <Text className="mt-2.5 font-sans text-[13px] text-white/78">Nível máximo alcançado</Text>
                  ) : progress.xpParaProximoNivel > 0 ? (
                    <Text className="mt-2.5 font-sans text-[13px] leading-relaxed text-white/78">
                      Faltam {progress.xpParaProximoNivel} XP para o nível {progress.nivel + 1}
                    </Text>
                  ) : null}
                </LinearGradient>
              </View>

              <View
                style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
                className="mt-5 flex-row gap-3"
              >
                <StatCard icon={BookOpen} label="Exploradas" value={progress.obrasExploradas} color="#1c756a" bg="#e8f7f4" />
                <StatCard icon={Trophy} label="Concluídas" value={progress.obrasConcluidas} color="#15803d" bg="#ecfdf3" />
                <StatCard icon={Sparkles} label="XP" value={progress.xp} color="#b45309" bg="#fef6e4" />
              </View>

              <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mt-8">
                <Text className="mb-1 font-sans-bold text-lg text-brand-navy">Faixas de leitura</Text>
                <Text className="mb-4 font-sans text-sm text-text-muted">
                  Cada faixa representa uma etapa da sua evolução como leitor.
                </Text>
                {FAIXAS_NIVEL.map((faixa) => {
                  const active = progress.nivel >= faixa.nivelMin && progress.nivel <= faixa.nivelMax
                  return (
                    <View
                      key={faixa.id}
                      className={`mb-2.5 flex-row items-center gap-3 rounded-2xl border p-4 ${active ? 'border-primary/30 bg-primary-light/40' : 'border-border bg-white'}`}
                    >
                      <View
                        className="h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: faixa.corClara }}
                      >
                        <Text className="font-sans-bold text-sm" style={{ color: faixa.cor }}>
                          {faixa.nivelMin}
                        </Text>
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="font-sans-semibold text-base text-text">{faixa.nome}</Text>
                        <Text className="font-sans text-xs text-text-muted">
                          Níveis {faixa.nivelMin}–{faixa.nivelMax}
                        </Text>
                      </View>
                      {active ? (
                        <Text className="font-sans-semibold text-xs uppercase text-primary">Atual</Text>
                      ) : null}
                    </View>
                  )
                })}
              </View>

              <View
                style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
                className="mt-4 rounded-2xl border border-dashed border-primary/20 bg-primary-light/20 p-5"
              >
                <Text className="font-sans-semibold text-sm text-brand-navy">Como ganhar XP</Text>
                <Text className="mt-2 font-sans text-sm leading-relaxed text-text-muted">
                  · {XP_EM_ANDAMENTO} XP ao iniciar uma leitura{'\n'}· {XP_CONCLUIDO} XP ao concluir uma obra
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </A11yScreen>
    </>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: typeof BookOpen
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <View className="min-w-0 flex-1 items-center rounded-2xl p-3.5" style={{ backgroundColor: bg }}>
      <Icon color={color} size={18} strokeWidth={1.75} />
      <Text className="mt-2 font-sans-bold text-lg" style={{ color }}>
        {value}
      </Text>
      <Text className="text-center font-sans-medium text-[10px] text-text-muted">{label}</Text>
    </View>
  )
}
