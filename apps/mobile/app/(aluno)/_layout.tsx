import { Redirect, Tabs } from 'expo-router'
import { BookOpen, Home, Library, User } from 'lucide-react-native'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useAuth } from '@/providers/AuthProvider'

export default function AlunoLayout() {
  const { session, profile, isLoading } = useAuth()
  const { fontMultiplier } = useAccessibility()
  const insets = useSafeAreaInsets()
  const tabBarBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 12)
  const tabLabelSize = Math.round(11 * fontMultiplier)
  const tabIconSize = Math.round(23 * fontMultiplier)

  if (isLoading) return null

  if (!session || !profile?.status || profile.perfil !== 'aluno') {
    return <Redirect href="/(auth)/login" />
  }

  if (profile.deve_trocar_senha) {
    return <Redirect href="/(auth)/trocar-senha" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1c756a',
        tabBarInactiveTintColor: '#5a7282',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#d4ebe6',
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
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={tabIconSize} strokeWidth={1.75} />,
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
  )
}
