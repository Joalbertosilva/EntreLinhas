import { useMutation } from '@tanstack/react-query'
import { Alert } from 'react-native'
import {
  deleteCoverByUrl,
  persistMyAvatarUrl,
  uploadProfileAvatarFromUri,
} from '@/lib/storage'
import { useAuth } from '@/providers/AuthProvider'

export interface AvatarPickMeta {
  uri: string
  mimeType?: string | null
  fileSize?: number
}

export function useProfileAvatarUpload() {
  const { profile, refreshProfile } = useAuth()

  const uploadMutation = useMutation({
    mutationFn: async (pick: AvatarPickMeta) => {
      if (!profile?.id) throw new Error('Faça login novamente.')
      const previous = profile.avatar_url ?? null
      const url = await uploadProfileAvatarFromUri(
        pick.uri,
        profile.id,
        pick.mimeType ?? 'image/jpeg',
        pick.fileSize,
      )
      try {
        await persistMyAvatarUrl(url)
      } catch (err) {
        await deleteCoverByUrl(url)
        throw err
      }
      if (previous && previous !== url) {
        await deleteCoverByUrl(previous)
      }
      return url
    },
    onSuccess: async () => {
      await refreshProfile()
      Alert.alert('Foto atualizada', 'Sua foto de perfil foi atualizada.')
    },
    onError: (err: Error) => {
      Alert.alert('Não foi possível enviar', err.message || 'Tente outra imagem.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('Faça login novamente.')
      const previous = profile.avatar_url ?? null
      await persistMyAvatarUrl(null)
      if (previous) await deleteCoverByUrl(previous)
    },
    onSuccess: async () => {
      await refreshProfile()
      Alert.alert('Foto removida', 'Voltamos a usar suas iniciais no perfil.')
    },
    onError: (err: Error) => {
      Alert.alert('Não foi possível remover', err.message || 'Tente novamente.')
    },
  })

  return {
    uploadAvatar: uploadMutation.mutate,
    uploadAvatarAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    removeAvatar: () => removeMutation.mutate(),
    isRemoving: removeMutation.isPending,
  }
}
