import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'

export default function NaoAlunoScreen() {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleExit = async () => {
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <LinearGradient colors={['#fafefc', '#e5f7f3', '#ffffff']} style={{ flex: 1 }}>
      <View className="flex-1 justify-center px-6">
        <View className="rounded-2xl border border-border bg-white p-6">
          <Text className="font-sans-bold text-xl text-brand-navy">Use o gerenciador web</Text>
          <Text className="mt-3 font-sans text-base leading-relaxed text-text-muted">
            Este aplicativo é exclusivo para alunos. Professores e administradores acessam pelo
            navegador em EntreLinhas Gerenciador.
          </Text>
          <Button variant="primary" label="Voltar ao login" onPress={() => void handleExit()} className="mt-6" />
        </View>
      </View>
    </LinearGradient>
  )
}
