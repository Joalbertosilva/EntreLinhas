import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthProvider'
import { deleteCoverByUrl, persistMyAvatarUrl, uploadProfileAvatar } from '@/lib/storage'

export function useProfileAvatarUpload() {
  const { profile, refreshProfile } = useAuth()

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.id) throw new Error('Faça login novamente.')
      const previous = profile.avatar_url ?? null
      const url = await uploadProfileAvatar(file, profile.id)
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
      toast.success('Foto de perfil atualizada.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Não foi possível enviar a foto.')
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
      toast.success('Foto de perfil removida.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Não foi possível remover a foto.')
    },
  })

  return {
    uploadAvatar: mutation.mutate,
    uploadAvatarAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    removeAvatar: () => removeMutation.mutate(),
    isRemoving: removeMutation.isPending,
  }
}
