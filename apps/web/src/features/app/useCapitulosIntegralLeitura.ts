import { useQuery } from '@tanstack/react-query'
import type { ConteudoCapituloIntegral } from '@tcc-sistema/types'
import { listCapitulosIntegralComTexto } from '@/lib/capitulosIntegralDb'

/** Carrega título + texto de todos os trechos (em páginas na API) para o leitor do aluno. */
export function useCapitulosIntegralLeitura(conteudoId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['capitulos-integral-leitura', conteudoId],
    enabled: Boolean(conteudoId) && enabled,
    staleTime: 60_000,
    refetchOnMount: 'always',
    retry: 2,
    queryFn: async (): Promise<ConteudoCapituloIntegral[]> => {
      if (!conteudoId) return []
      const caps = await listCapitulosIntegralComTexto(conteudoId)
      const comTexto = caps.filter((c) => c.texto_pt?.trim().length >= 12)
      if (comTexto.length < 2) {
        throw new Error(
          'O texto integral não chegou completo. Peça ao professor para enviar o PDF ou o link de novo.',
        )
      }
      return comTexto
    },
  })
}