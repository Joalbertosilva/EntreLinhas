import { Image } from 'expo-image'
import { Text, View } from 'react-native'
import { capaImageUri } from '@/lib/imageUrl'
import { initialsFromName } from '@/lib/profileInitials'

interface AvatarProps {
  name: string
  imageUrl?: string | null
  size?: number
  tone?: 'primary' | 'navy'
}

const TONE_BG = {
  primary: '#1c756a',
  navy: '#1a3342',
} as const

export function Avatar({ name, imageUrl, size = 32, tone = 'primary' }: AvatarProps) {
  const initials = initialsFromName(name)
  const resolved = capaImageUri(imageUrl, imageUrl?.split('v=').pop())

  const fontSize = size <= 28 ? 10 : size <= 40 ? 12 : size <= 56 ? 16 : 20

  if (resolved) {
    return (
      <Image
        source={{ uri: resolved }}
        accessibilityLabel=""
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    )
  }

  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: TONE_BG[tone] }}
    >
      <Text className="font-sans-bold text-white" style={{ fontSize }}>
        {initials || '?'}
      </Text>
    </View>
  )
}
