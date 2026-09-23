import { Redirect, Stack } from 'expo-router'
import { View } from 'react-native'
import { AccountSheet } from '@/components/layout/AccountSheet'
import { AppNavigationDrawer } from '@/components/layout/AppNavigationDrawer'
import { AppShellProvider } from '@/components/layout/AppShellProvider'
import { canUseMobileApp } from '@/lib/perfilLabels'
import { useAuth } from '@/providers/AuthProvider'

export default function AlunoLayout() {
  const { session, profile, isLoading } = useAuth()

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
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="perfil" />
          <Stack.Screen name="progresso" />
          <Stack.Screen name="alterar-senha" />
          <Stack.Screen name="minha-obra" />
          <Stack.Screen name="conteudo/[id]" />
          <Stack.Screen name="obra/[id]" />
        </Stack>

        <AppNavigationDrawer />
        <AccountSheet />
      </View>
    </AppShellProvider>
  )
}
