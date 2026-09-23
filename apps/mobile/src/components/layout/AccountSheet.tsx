import { LinearGradient } from 'expo-linear-gradient'
import { DRAWER_GRADIENT, DRAWER_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { useRouter, type Href } from 'expo-router'
import { ChevronRight, LogOut, X } from 'lucide-react-native'
import { Alert, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '@/components/ui/Avatar'
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
      <Pressable className="flex-1 justify-end bg-black/55" onPress={closeAccount}>
        <Pressable onPress={(e) => e.stopPropagation()} className="max-h-[88%] overflow-hidden rounded-t-3xl">
          <LinearGradient
            colors={[...DRAWER_GRADIENT]}
            locations={[...DRAWER_GRADIENT_LOCATIONS]}
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            <View className="items-end px-4 pt-3">
              <Pressable
                onPress={closeAccount}
                accessibilityLabel="Fechar"
                className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
              >
                <X color="#ffffff" size={18} />
              </Pressable>
            </View>

            <View className="items-center px-6 pb-5 pt-2">
              <Avatar name={profile.nome} size={72} />
              <Text className="mt-3 text-center font-sans-bold text-xl text-white">{profile.nome}</Text>
              <Text className="mt-0.5 font-sans text-sm text-white/75">@{profile.nome_usuario}</Text>
              <View className="mt-2 rounded-full bg-white/15 px-3 py-1">
                <Text className="font-sans-semibold text-[10px] uppercase tracking-wide text-white/90">
                  {perfilLabel}
                </Text>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
            >
              <View className="overflow-hidden rounded-2xl bg-white/8">
                {menuItems.map((item, index) => (
                  <Pressable
                    key={item.label}
                    onPress={() => handleItem(item)}
                    className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-white/10 ${
                      index < menuItems.length - 1 ? 'border-b border-white/10' : ''
                    }`}
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-lg bg-white/12">
                      <item.icon color="#ffffff" size={18} strokeWidth={1.75} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="font-sans-semibold text-[15px] text-white">{item.label}</Text>
                      {item.hint ? (
                        <Text className="mt-0.5 font-sans text-xs text-white/60" numberOfLines={1}>
                          {item.hint}
                        </Text>
                      ) : null}
                    </View>
                    <ChevronRight color="#ffffff99" size={16} />
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={() => void handleSignOut()}
                className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-white/15 py-3.5 active:bg-white/8"
              >
                <LogOut color="#ffffffb3" size={18} strokeWidth={1.75} />
                <Text className="font-sans-semibold text-sm text-white/85">Sair da conta</Text>
              </Pressable>
            </ScrollView>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
