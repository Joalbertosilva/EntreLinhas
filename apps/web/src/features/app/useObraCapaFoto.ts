import { useQuery } from '@tanstack/react-query'
import { resolveObraCapaFotoUrl } from '@/lib/obraCapaFoto'

export function useObraCapaFoto(userId: string | undefined, obraId: string | undefined) {
  return useQuery({
    queryKey: ['obra-capa-foto', userId, obraId],
    enabled: Boolean(userId && obraId),
    queryFn: () => resolveObraCapaFotoUrl(userId!, obraId!),
    staleTime: 5 * 60_000,
  })
}
