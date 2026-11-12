import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { Award, Camera } from 'lucide-react-native'
import { useProfileAvatarUpload } from '@/features/app/useProfileAvatarUpload'
import { AVATAR_RING_GRADIENT, LEVEL_BADGE_GRADIENT } from '@/lib/brandTheme'
import { capaImageUri } from '@/lib/imageUrl'
import { initialsFromName } from '@/lib/profileInitials'

interface ReaderProfileAvatarProps {
  name: string
  imageUrl?: string | null
  nivel?: number
  showLevelBadge?: boolean
  editable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { outer: 44, ring: 3, font: 11, badgeH: 26, badgeMinW: 30, badgeIcon: 10, badgeFont: 11 },
  md: { outer: 58, ring: 3, font: 14, badgeH: 28, badgeMinW: 34, badgeIcon: 11, badgeFont: 12 },
  lg: { outer: 88, ring: 4, font: 20, badgeH: 32, badgeMinW: 38, badgeIcon: 12, badgeFont: 13 },
} as const

export function ReaderProfileAvatar({
  name,
  imageUrl,
  nivel,
  showLevelBadge = true,
  editable = false,
  size = 'md',
}: ReaderProfileAvatarProps) {
  const dims = SIZES[size]
  const { uploadAvatar, isUploading, isRemoving } = useProfileAvatarUpload()
  const busy = isUploading || isRemoving
  const resolved = capaImageUri(imageUrl, imageUrl?.split('v=').pop())
  const initials = initialsFromName(name)

  const pickPhoto = async () => {
    if (!editable || busy) return
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permissão', 'Precisamos de acesso à galeria para escolher sua foto.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    uploadAvatar({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileSize: asset.fileSize,
    })
  }

  const innerPhoto = (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-white"
      style={{ padding: 2, width: dims.outer + 4, height: dims.outer + 4 }}
    >
      <View
        className="items-center justify-center overflow-hidden rounded-full bg-primary"
        style={{ width: dims.outer, height: dims.outer }}
      >
        {resolved ? (
          <Image
            source={{ uri: resolved }}
            style={{ width: dims.outer, height: dims.outer }}
            contentFit="cover"
            accessibilityLabel=""
            cachePolicy="memory-disk"
          />
        ) : (
          <Text className="font-sans-bold text-white" style={{ fontSize: dims.font }}>
            {initials}
          </Text>
        )}
        {busy ? (
          <View className="absolute inset-0 items-center justify-center bg-brand-navy/45">
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : null}
        {editable && !busy ? (
          <View className="absolute inset-x-0 bottom-0 items-center bg-brand-navy/75 py-1">
            <Camera color="#ffffff" size={12} strokeWidth={2} />
          </View>
        ) : null}
      </View>
    </View>
  )

  return (
    <View className="relative items-center" style={{ width: dims.outer + dims.badgeMinW / 2 + 4 }}>
      <LinearGradient
        colors={[...AVATAR_RING_GRADIENT]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{
          padding: dims.ring,
          borderRadius: 999,
          shadowColor: '#003366',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.14,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {editable ? (
          <Pressable
            onPress={() => void pickPhoto()}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
            disabled={busy}
          >
            {innerPhoto}
          </Pressable>
        ) : (
          innerPhoto
        )}
      </LinearGradient>

      {showLevelBadge && nivel != null ? (
        <View
          className="absolute"
          style={{ right: -4, bottom: 2, shadowColor: '#003366', shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 }}
          accessibilityLabel={`Nível ${nivel}`}
        >
          <LinearGradient
            colors={[...LEVEL_BADGE_GRADIENT]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              minWidth: dims.badgeMinW,
              height: dims.badgeH,
              paddingHorizontal: 6,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: '#ffffff',
            }}
          >
            <Award color="#ffffff" size={dims.badgeIcon} strokeWidth={2.25} />
            <Text className="font-sans-bold text-white" style={{ fontSize: dims.badgeFont }}>
              {nivel}
            </Text>
          </LinearGradient>
        </View>
      ) : null}
    </View>
  )
}
