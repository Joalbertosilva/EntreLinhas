import { Redirect, Tabs } from 'expo-router'
import { BookOpen, Home, Library, Search } from 'lucide-react-native'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AccountSheet } from '@/components/layout/AccountSheet'
import { AppNavigationDrawer } from '@/components/layout/AppNavigationDrawer'
import { AppShellProvider } from '@/components/layout/AppShellProvider'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { canUseMobileApp } from '@/lib/perfilLabels'
import { useAuth } from '@/providers/AuthProvider'

export default function AlunoLayout() {
  const { session, profile, isLoading } = useAuth()
  const { fontMultiplier } = useAccessibility()
  const insets = useSafeAreaInsets()
  const tabBarBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 12)
  const tabLabelSize = Math.round(11 * fontMultiplier)
  const tabIconSize = Math.round(23 * fontMultiplier)

  if (isLoading) return null

  if (!session || !profile?.status || !canUseMobileApp(profile.perfil)) {
    return <Redirect href="/(auth)/login" />
  }

  if (profile.deve_trocar_senha) {
    return <Redirect href="/(auth)/trocar-senha" />
  }

  return (
    <AppShellProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#1a3342',
            tabBarInactiveTintColor: '#5a7282',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopColor: '#cdd9e3',
              borderTopWidth: 1,
              height: 52 + tabBarBottom,
              paddingBottom: tabBarBottom,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontFamily: 'PlusJakartaSans_600SemiBold',
              fontSize: tabLabelSize,
              marginTop: 2,
            },
            tabBarIconStyle: {
              marginTop: 2,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Início',
              tabBarIcon: ({ color }) => <Home color={color} size={tabIconSize} strokeWidth={1.75} />,
            }}
          />
          <Tabs.Screen
            name="explorar"
            options={{
              title: 'Explorar',
              tabBarIcon: ({ color }) => <Library color={color} size={tabIconSize} strokeWidth={1.75} />,
            }}
          />
          <Tabs.Screen
            name="leituras"
            options={{
              title: 'Leituras',
              tabBarIcon: ({ color }) => <BookOpen color={color} size={tabIconSize} strokeWidth={1.75} />,
            }}
          />
          <Tabs.Screen
            name="pesquisa"
            options={{
              title: 'Pesquisa',
              tabBarIcon: ({ color }) => <Search color={color} size={tabIconSize} strokeWidth={1.75} />,
            }}
          />
          <Tabs.Screen
            name="perfil"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tabs.Screen
            name="conteudo/[id]"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tabs.Screen
            name="obra/[id]"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tabs.Screen
            name="minha-obra"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tabs.Screen
            name="progresso"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tabs.Screen
            name="alterar-senha"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
            }}
          />
        </Tabs>

        <AppNavigationDrawer />
        <AccountSheet />
      </View>
    </AppShellProvider>
  )
}
