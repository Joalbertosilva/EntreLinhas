import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { BookOpen, ChevronRight, ExternalLink, Lock, PenLine, Sparkles, Type } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { ProfileMenuItem } from '@/components/ui/ProfileMenuItem'
import { Button } from '@/components/ui/Button'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useAlunoProgress } from '@/features/progress/useAlunoProgress'
import { useMinhasLeituras } from '@/features/leituras/useMinhasLeituras'
import { faixaDoNivel, tituloJornada } from '@/lib/alunoProgress'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { isStaffPerfil, PERFIL_LABELS } from '@/lib/perfilLabels'
import { getAdminWebUrl } from '@/lib/webAppUrl'
import { useAuth } from '@/providers/AuthProvider'

export default function PerfilScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const { data: progress, isLoading } = useAlunoProgress(profile?.id)
  const { data: leituras } = useMinhasLeituras(profile?.id)
  const { setModeEnabled } = useAccessibility()
  const tabPadding = 72 + Math.max(insets.bottom, 12)

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
  const initials = profile?.nome
    ?.split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') ?? '?'

  return (
    <A11yScreen>
      <LinearGradient colors={['#f7fdfc', '#ffffff']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingBottom: tabPadding,
            paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
            paddingRight: 56,
          }}
        >
          <Text className="font-sans-bold text-2xl text-brand-navy">Minha conta</Text>
          <Text className="mt-1 font-sans text-sm text-text-muted">Seus dados, leituras e preferências.</Text>

          <View className="mt-6 overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
            <LinearGradient
              colors={[faixa.cor, `${faixa.cor}ee`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
            >
              <View className="items-center">
                <View className="h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/20">
                  <Text className="font-sans-bold text-2xl text-white">{initials}</Text>
                </View>
                <Text className="mt-4 text-center font-sans-bold text-lg text-white">{profile?.nome}</Text>
                <Text className="mt-1 font-sans text-sm text-white/85">@{profile?.nome_usuario}</Text>
                <View className="mt-3 rounded-full bg-white/20 px-3 py-1">
                  <Text className="font-sans-semibold text-[10px] uppercase tracking-wide text-white">
                    {perfilLabel}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View className="mt-4 flex-row gap-3">
            <MiniStat label="Leituras" value={totalLeituras} />
            <MiniStat label="Nível" value={progress?.nivel ?? 1} />
            <MiniStat label="XP" value={progress?.xp ?? 0} />
          </View>

          {!isLoading && progress ? (
            <Pressable
              onPress={() => router.push('/(aluno)/progresso')}
              accessibilityRole="button"
              accessibilityLabel="Ver minha jornada de leitura"
              className="mt-3 flex-row items-center gap-3 rounded-xl border border-border bg-white px-3.5 py-3 active:bg-primary-light/20"
            >
              <View
                className="h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: faixa.corClara }}
              >
                <BookOpen color={faixa.cor} size={16} strokeWidth={1.75} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-sans-semibold text-sm text-brand-navy">
                  {tituloJornada(progress.nivel)}
                </Text>
                <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-primary/10">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress.progressoNivelPct}%` }}
                  />
                </View>
                {!progress.nivelMaximo ? (
                  <Text className="mt-1 font-sans text-[11px] text-text-muted">
                    {progress.progressoNivelPct}% · faltam {progress.xpParaProximoNivel} XP
                  </Text>
                ) : (
                  <Text className="mt-1 font-sans text-[11px] text-text-muted">Nível máximo</Text>
                )}
              </View>
              <ChevronRight color="#94a3b8" size={16} />
            </Pressable>
          ) : null}

          <View className="mb-3 mt-8">
            <Text className="font-sans-bold text-lg text-brand-navy">Explore sua conta</Text>
            <Text className="mt-1 font-sans text-sm text-text-muted">
              Leitura, escrita e configurações em um só lugar.
            </Text>
          </View>

          <ProfileMenuItem
            icon={Sparkles}
            label="Minha jornada"
            hint="XP, níveis e faixas de leitura"
            onPress={() => router.push('/(aluno)/progresso')}
          />
          <ProfileMenuItem
            icon={BookOpen}
            label="Minhas leituras"
            hint={`${totalLeituras} ${totalLeituras === 1 ? 'título' : 'títulos'} na biblioteca`}
            onPress={() => router.push('/(aluno)/leituras')}
            color="#155a52"
            bg="#d4f0ea"
          />
          <ProfileMenuItem
            icon={PenLine}
            label="Minha obra"
            hint="Escrever e publicar na comunidade"
            onPress={() => router.push('/(aluno)/minha-obra')}
            color="#b45309"
            bg="#fef6e4"
          />
          <ProfileMenuItem
            icon={Lock}
            label="Alterar senha"
            hint="Atualize sua senha de acesso"
            onPress={() => router.push('/(aluno)/alterar-senha')}
          />
          <ProfileMenuItem
            icon={Type}
            label="Acessibilidade"
            hint="Texto maior e preferências de áudio"
            onPress={() => setModeEnabled(true)}
          />

          {isStaff ? (
            <ProfileMenuItem
              icon={ExternalLink}
              label="Painel administrativo"
              hint="Gerenciar usuários, conteúdos e alunos na web"
              onPress={() => void openAdminPanel()}
              color="#1c756a"
              bg="#e8f7f4"
            />
          ) : null}

          <Button variant="outline" label="Sair da conta" onPress={() => void handleSignOut()} className="mt-6" />
        </ScrollView>
      </LinearGradient>
    </A11yScreen>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View className="min-w-0 flex-1 items-center rounded-2xl border border-border bg-white py-3.5">
      <Text className="font-sans-bold text-lg text-brand-navy">{value}</Text>
      <Text className="font-sans-medium text-[10px] uppercase tracking-wide text-text-muted">{label}</Text>
    </View>
  )
}
