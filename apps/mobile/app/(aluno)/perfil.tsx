import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { BookOpen, ChevronRight, ExternalLink, Lock, PenLine, Sparkles, Type } from 'lucide-react-native'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { PlatformBackground } from '@/components/layout/PlatformBackground'
import { ScreenBackHeader } from '@/components/layout/ScreenBackHeader'
import { ProfileMenuItem } from '@/components/ui/ProfileMenuItem'
import { Avatar } from '@/components/ui/Avatar'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useAlunoProgress } from '@/features/progress/useAlunoProgress'
import { useMinhasLeituras } from '@/features/leituras/useMinhasLeituras'
import { faixaDoNivel, tituloJornada } from '@/lib/alunoProgress'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useStackScreenInsets } from '@/lib/useStackScreenInsets'
import { isStaffPerfil, PERFIL_LABELS } from '@/lib/perfilLabels'
import { getAdminWebUrl } from '@/lib/webAppUrl'
import { useAuth } from '@/providers/AuthProvider'

export default function PerfilScreen() {
  const { insets, scrollPaddingBottom } = useStackScreenInsets()
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const { data: progress, isLoading } = useAlunoProgress(profile?.id)
  const { data: leituras } = useMinhasLeituras(profile?.id)
  const { setModeEnabled } = useAccessibility()

  const totalLeituras =
    (leituras?.em_andamento.length ?? 0) +
    (leituras?.na_lista.length ?? 0) +
    (leituras?.concluido.length ?? 0)

  const isStaff = isStaffPerfil(profile?.perfil)
  const perfilLabel = profile?.perfil ? PERFIL_LABELS[profile.perfil] : 'Usuário'

  const handleSignOut = async () => {
    await signOut()
    router.replace('/(auth)/login')
  }

  const openAdminPanel = async () => {
    const url = getAdminWebUrl()
    try {
      const supported = await Linking.canOpenURL(url)
      if (!supported) {
        Alert.alert('Gerenciador web', `Abra no navegador: ${url}`)
        return
      }
      await Linking.openURL(url)
    } catch {
      Alert.alert('Gerenciador web', `Não foi possível abrir o link. Acesse: ${url}`)
    }
  }

  const faixa = progress ? faixaDoNivel(progress.nivel) : faixaDoNivel(1)

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
      <A11yScreen>
        <PlatformBackground style={{ paddingTop: insets.top }}>
          <ScreenBackHeader title="Minha conta" subtitle="Seu perfil, jornada e preferências" />
          <ScrollView
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: scrollPaddingBottom,
              paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
            }}
          >
            <LinearGradient
              colors={['#ffffff', '#f8fdfb', '#eef9f6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                marginTop: 8,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(212, 235, 230, 0.9)',
                paddingHorizontal: 18,
                paddingVertical: 18,
              }}
            >
              <View className="flex-row items-center gap-3.5">
                <Avatar name={profile?.nome ?? '?'} size={60} />
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-bold text-xl text-brand-navy" numberOfLines={2}>
                    {profile?.nome}
                  </Text>
                  <Text className="mt-0.5 font-sans text-sm text-text-muted" numberOfLines={1}>
                    @{profile?.nome_usuario}
                  </Text>
                  <View className="mt-2 self-start rounded-full bg-primary-light px-2.5 py-0.5">
                    <Text className="font-sans-semibold text-[10px] uppercase tracking-wide text-primary">
                      {perfilLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 flex-row gap-2.5">
                <MiniStat label="Leituras" value={totalLeituras} />
                <MiniStat label="Nível" value={progress?.nivel ?? 1} />
                <MiniStat label="XP" value={progress?.xp ?? 0} />
              </View>
            </LinearGradient>

            {!isLoading && progress ? (
              <Pressable
                onPress={() => router.push('/(aluno)/progresso')}
                accessibilityRole="button"
                accessibilityLabel="Ver minha jornada de leitura"
                className="mt-4 flex-row items-center gap-3 rounded-2xl border border-border/80 bg-white px-4 py-3.5 active:bg-primary-light/15"
                style={{
                  shadowColor: '#1a3342',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  elevation: 2,
                }}
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: faixa.corClara }}
                >
                  <BookOpen color={faixa.cor} size={18} strokeWidth={1.75} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-semibold text-sm text-brand-navy">
                    {tituloJornada(progress.nivel)}
                  </Text>
                  <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10">
                    <View
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress.progressoNivelPct}%` }}
                    />
                  </View>
                  {!progress.nivelMaximo ? (
                    <Text className="mt-1.5 font-sans text-[11px] text-text-muted">
                      {progress.progressoNivelPct}% · faltam {progress.xpParaProximoNivel} XP
                    </Text>
                  ) : (
                    <Text className="mt-1.5 font-sans text-[11px] text-text-muted">Nível máximo</Text>
                  )}
                </View>
                <ChevronRight color="#94a3b8" size={16} />
              </Pressable>
            ) : null}

            <Text className="mb-2.5 mt-7 font-sans-semibold text-[11px] uppercase tracking-wider text-text-muted">
              Atalhos
            </Text>

            <View className="overflow-hidden rounded-2xl border border-border/80 bg-white">
              <ProfileMenuItem
                variant="list"
                icon={Sparkles}
                label="Minha jornada"
                hint="XP, níveis e faixas de leitura"
                onPress={() => router.push('/(aluno)/progresso')}
              />
              <ProfileMenuItem
                variant="list"
                icon={BookOpen}
                label="Minhas leituras"
                hint={`${totalLeituras} ${totalLeituras === 1 ? 'título' : 'títulos'} na biblioteca`}
                onPress={() => router.push('/(aluno)/(tabs)/leituras')}
                color="#155a52"
                bg="#d4f0ea"
              />
              <ProfileMenuItem
                variant="list"
                icon={PenLine}
                label="Minha obra"
                hint="Escrever e publicar na comunidade"
                onPress={() => router.push('/(aluno)/minha-obra')}
                color="#b45309"
                bg="#fef6e4"
              />
              <ProfileMenuItem
                variant="list"
                icon={Lock}
                label="Alterar senha"
                hint="Atualize sua senha de acesso"
                onPress={() => router.push('/(aluno)/alterar-senha')}
              />
              <ProfileMenuItem
                variant="list"
                icon={Type}
                label="Acessibilidade"
                hint="Texto maior e preferências de áudio"
                onPress={() => setModeEnabled(true)}
                isLast={!isStaff}
              />
              {isStaff ? (
                <ProfileMenuItem
                  variant="list"
                  icon={ExternalLink}
                  label="Painel administrativo"
                  hint="Gerenciar usuários, conteúdos e alunos na web"
                  onPress={() => void openAdminPanel()}
                  color="#1c756a"
                  bg="#e8f7f4"
                  isLast
                />
              ) : null}
            </View>

            <Pressable
              onPress={() => void handleSignOut()}
              className="mt-4 items-center rounded-2xl border border-border/80 bg-white py-3.5 active:bg-primary-light/15"
            >
              <Text className="font-sans-semibold text-sm text-text-muted">Sair da conta</Text>
            </Pressable>
          </ScrollView>
        </PlatformBackground>
      </A11yScreen>
    </>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View className="min-w-0 flex-1 items-center rounded-xl bg-white/70 py-3">
      <Text className="font-sans-bold text-lg text-brand-navy">{value}</Text>
      <Text className="font-sans-medium text-[10px] uppercase tracking-wide text-text-muted">{label}</Text>
    </View>
  )
}
