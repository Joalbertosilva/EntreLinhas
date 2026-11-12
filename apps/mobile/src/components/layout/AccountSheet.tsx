import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, type Href } from 'expo-router'
import { ChevronRight, Info, LogOut, X } from 'lucide-react-native'
import { Alert, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ReaderProfileAvatar } from '@/features/app/ReaderProfileAvatar'
import { useAlunoProgress } from '@/features/progress/useAlunoProgress'
import { ProfileMenuItem } from '@/components/ui/ProfileMenuItem'
import { useAppShell } from '@/components/layout/AppShellProvider'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import {
  ACCOUNT_MENU_ITEMS,
  ADMIN_ACCOUNT_ITEM,
  PERFIL_LABELS,
} from '@/features/app/accountMenu'
import { isStaffPerfil } from '@/lib/perfilLabels'
import { getAdminWebUrl } from '@/lib/webAppUrl'
import { useAuth } from '@/providers/AuthProvider'

export function AccountSheet() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const { data: progress } = useAlunoProgress(profile?.id)
  const { accountOpen, closeAccount } = useAppShell()
  const { setModeEnabled } = useAccessibility()

  if (!profile) return null

  const perfilLabel = PERFIL_LABELS[profile.perfil]
  const isStaff = isStaffPerfil(profile.perfil)
  const menuItems = [
    ...ACCOUNT_MENU_ITEMS.filter((item) => item.href !== '/(aluno)/perfil' && item.href !== '/(aluno)/sobre'),
    ...(isStaff ? [ADMIN_ACCOUNT_ITEM] : []),
  ]

  const handleSignOut = async () => {
    closeAccount()
    await signOut()
    router.replace('/(auth)/login')
  }

  const openAdminPanel = async () => {
    closeAccount()
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

  const goTo = (href: Href) => {
    closeAccount()
    router.push(href)
  }

  const handleItem = (item: (typeof menuItems)[number]) => {
    if (item.action === 'accessibility') {
      closeAccount()
      setModeEnabled(true)
      return
    }
    if (item.action === 'admin-panel') {
      void openAdminPanel()
      return
    }
    goTo(item.href as Href)
  }

  return (
    <Modal visible={accountOpen} animationType="slide" transparent onRequestClose={closeAccount}>
      <Pressable className="flex-1 justify-end bg-brand-navy/45" onPress={closeAccount}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="max-h-[90%] overflow-hidden rounded-t-[28px] bg-[#f4f8f7]"
        >
          <LinearGradient
            colors={['#dcefea', '#eef9f6', '#f4f8f7']}
            locations={[0, 0.55, 1]}
            style={{ paddingTop: 12, paddingBottom: insets.bottom + 16 }}
          >
            <View className="flex-row items-center justify-end px-5 pb-1 pt-1">
              <Pressable
                onPress={closeAccount}
                accessibilityLabel="Fechar"
                className="h-9 w-9 items-center justify-center rounded-full bg-white/80 active:opacity-80"
              >
                <X color="#1a3342" size={18} strokeWidth={2} />
              </Pressable>
            </View>

            <View className="px-4">
              <Text className="font-sans-semibold text-[11px] uppercase tracking-wider text-primary/90">
                Minha conta
              </Text>
              <Pressable
                onPress={() => goTo('/(aluno)/perfil')}
                accessibilityRole="button"
                accessibilityLabel="Abrir minha conta"
                className="mt-2 flex-row items-center gap-3.5 rounded-2xl border border-white/80 bg-white/95 px-4 py-4 active:bg-primary-light/20"
              >
                <ReaderProfileAvatar
                  name={profile.nome}
                  imageUrl={profile.avatar_url}
                  nivel={progress?.nivel}
                  showLevelBadge={progress != null}
                  size="sm"
                />
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-bold text-[17px] text-brand-navy" numberOfLines={2}>
                    {profile.nome}
                  </Text>
                  <Text className="mt-0.5 font-sans text-sm text-text-muted" numberOfLines={1}>
                    @{profile.nome_usuario}
                  </Text>
                  <View className="mt-2 self-start rounded-full bg-primary-light px-2.5 py-0.5">
                    <Text className="font-sans-semibold text-[10px] uppercase tracking-wide text-primary">
                      {perfilLabel}
                    </Text>
                  </View>
                </View>
                <ChevronRight color="#94a3b8" size={18} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}
            >
              <View className="overflow-hidden rounded-2xl border border-border/70 bg-white">
                <Pressable
                  onPress={() => goTo('/(aluno)/sobre')}
                  accessibilityRole="button"
                  accessibilityLabel="Sobre o aplicativo"
                  className="flex-row items-center gap-3 border-b border-border/60 px-4 py-3.5 active:bg-primary-light/15"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
                    <Info color="#1c756a" size={18} strokeWidth={1.75} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-sans-semibold text-sm text-brand-navy">Sobre o aplicativo</Text>
                    <Text className="font-sans text-xs text-text-muted">Créditos, versão e suporte</Text>
                  </View>
                  <ChevronRight color="#94a3b8" size={16} />
                </Pressable>

                {menuItems.map((item, index) => (
                  <ProfileMenuItem
                    key={item.label}
                    variant="list"
                    icon={item.icon}
                    label={item.label}
                    hint={item.hint}
                    onPress={() => handleItem(item)}
                    isLast={index === menuItems.length - 1}
                  />
                ))}
              </View>

              <Pressable
                onPress={() => void handleSignOut()}
                className="mt-4 mb-2 flex-row items-center justify-center gap-2 rounded-2xl border border-border/80 bg-white py-3.5 active:bg-primary-light/25"
              >
                <LogOut color="#5a7282" size={18} strokeWidth={1.75} />
                <Text className="font-sans-semibold text-sm text-text-muted">Sair da conta</Text>
              </Pressable>
            </ScrollView>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
