import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'

export default function PerfilScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <LinearGradient colors={['#ffffff', '#f7fdfc']} style={{ flex: 1, paddingTop: insets.top + 16 }}>
      <View className="px-6">
        <Text className="font-sans-bold text-2xl text-brand-navy">Minha conta</Text>
        <Text className="mt-2 font-sans text-base text-text-muted">
          Dados, senha e preferências do seu perfil.
        </Text>

        <View className="mt-6 rounded-2xl border border-border bg-white p-5">
          <Text className="font-sans-semibold text-base text-text">{profile?.nome}</Text>
          <Text className="mt-1 font-sans text-sm text-text-muted">@{profile?.nome_usuario}</Text>
        </View>

        <Button
          variant="outline"
          label="Sair"
          onPress={() => void handleSignOut()}
          className="mt-6"
        />
      </View>
    </LinearGradient>
  )
}
