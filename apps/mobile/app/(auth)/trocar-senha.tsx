import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder'

export default function TrocarSenhaScreen() {
  return (
    <LinearGradient colors={['#fafefc', '#ffffff']} style={{ flex: 1 }}>
      <View className="flex-1 justify-center">
        <ScreenPlaceholder
          title="Troca de senha obrigatória"
          description="Esta tela será implementada na próxima etapa. Por enquanto, conclua a troca de senha pela plataforma web."
        />
      </View>
    </LinearGradient>
  )
}
