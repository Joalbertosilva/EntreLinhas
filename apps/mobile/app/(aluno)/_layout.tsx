import { Redirect, Tabs } from 'expo-router'
import { BookOpen, Home, Library, User } from 'lucide-react-native'
import { useAuth } from '@/providers/AuthProvider'

export default function AlunoLayout() {
  const { session, profile, isLoading } = useAuth()

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
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => <Library color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="leituras"
        options={{
          title: 'Leituras',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="conteudo/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
