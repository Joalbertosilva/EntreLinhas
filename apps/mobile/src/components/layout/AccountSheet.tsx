import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, type Href } from 'expo-router'
import { ChevronRight, LogOut, X } from 'lucide-react-native'
import { Alert, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '@/components/ui/Avatar'
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
  const { accountOpen, closeAccount } = useAppShell()
  const { setModeEnabled } = useAccessibility()

  if (!profile) return null

  const perfilLabel = PERFIL_LABELS[profile.perfil]
  const isStaff = isStaffPerfil(profile.perfil)
  const menuItems = [...ACCOUNT_MENU_ITEMS, ...(isStaff ? [ADMIN_ACCOUNT_ITEM] : [])]

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
    closeAccount()
    router.push(item.href as Href)
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
            style={{ paddingTop: 12, paddingBottom: insets.bottom + 10 }}
          >
            <View className="flex-row items-center justify-between px-5 pb-1 pt-1">
              <Text className="font-sans-bold text-lg text-brand-navy">Minha conta</Text>
              <Pressable
                onPress={closeAccount}
                accessibilityLabel="Fechar"
                className="h-9 w-9 items-center justify-center rounded-full bg-white/80 active:opacity-80"
              >
                <X color="#1a3342" size={18} strokeWidth={2} />
              </Pressable>
            </View>

            <View className="mx-4 mt-3 flex-row items-center gap-3.5 rounded-2xl border border-white/80 bg-white/90 px-4 py-4">
              <Avatar name={profile.nome} size={56} />
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
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
            >
              <View className="overflow-hidden rounded-2xl border border-border/70 bg-white">
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
                className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-border/80 bg-white py-3.5 active:bg-primary-light/25"
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
