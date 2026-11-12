import { useQuery } from '@tanstack/react-query'
import { resolveObraCapaFotoUri } from '@/lib/obraCapaFoto'

export function useObraCapaFoto(userId: string | undefined, obraId: string | undefined) {
  return useQuery({
    queryKey: ['obra-capa-foto', userId, obraId],
    enabled: Boolean(userId && obraId),
    queryFn: () => resolveObraCapaFotoUri(userId!, obraId!),
    staleTime: 5 * 60_000,
  })
}
