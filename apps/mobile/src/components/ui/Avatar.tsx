import { Text, View } from 'react-native'

interface AvatarProps {
  name: string
  size?: number
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const fontSize = size <= 28 ? 10 : size <= 40 ? 12 : size <= 56 ? 16 : 20

  return (
    <View
      className="items-center justify-center rounded-full bg-primary"
      style={{ width: size, height: size }}
    >
      <Text className="font-sans-bold text-white" style={{ fontSize }}>
        {initials || '?'}
      </Text>
    </View>
  )
}
