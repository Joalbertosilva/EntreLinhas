import { Pressable, Text, View } from 'react-native'
import { Menu } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BrandLogo } from '@/components/auth/BrandLogo'
import { Avatar } from '@/components/ui/Avatar'
import { useAppShell } from '@/components/layout/AppShellProvider'
import { useAuth } from '@/providers/AuthProvider'

export function AppTopBar() {
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()
  const { openDrawer, openAccount } = useAppShell()

  return (
    <View
      className="border-b border-sky-mid bg-white/95"
      style={{ paddingTop: insets.top, paddingBottom: 10 }}
    >
      <View className="flex-row items-center px-4">
        <Pressable
          onPress={openDrawer}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-primary-light/50"
        >
          <Menu color="#1a3342" size={22} strokeWidth={1.75} />
        </Pressable>

        <View className="min-w-0 flex-1 items-center">
          <View className="flex-row items-center gap-2">
            <BrandLogo variant="mark" showTagline={false} markSize={32} backdrop="light" />
            <Text className="font-sans-bold text-base text-brand-navy">EntreLinhas</Text>
          </View>
        </View>

        <Pressable
          onPress={openAccount}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu da conta"
          className="rounded-full p-0.5 active:opacity-80"
        >
          <Avatar name={profile?.nome ?? '?'} size={36} />
        </Pressable>
      </View>
    </View>
  )
}
