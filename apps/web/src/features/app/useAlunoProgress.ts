import { useQuery } from '@tanstack/react-query'
import { fetchAlunoProgress } from '@/features/app/progressCopy'

export function useAlunoProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ['aluno-progress', userId],
    enabled: Boolean(userId),
    queryFn: () => fetchAlunoProgress(userId!),
    staleTime: 60_000,
  })
}
