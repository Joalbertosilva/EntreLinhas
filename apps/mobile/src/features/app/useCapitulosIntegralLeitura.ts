import { useQuery } from '@tanstack/react-query'
import type { ConteudoCapituloIntegral } from '@tcc-sistema/types'
import { listCapitulosIntegral, listCapitulosIntegralComTexto } from '@/lib/capitulosIntegralDb'

export function useCapitulosIntegralLista(conteudoId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['capitulos-integral', conteudoId],
    enabled: Boolean(conteudoId) && enabled,
    staleTime: 60_000,
    queryFn: async () => {
      if (!conteudoId) return []
      return listCapitulosIntegral(conteudoId)
    },
  })
}

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
      const comTexto = caps.filter((c) => c.texto_pt?.trim().length >= 1)
      if (comTexto.length < 1) {
        throw new Error('O professor ainda não publicou páginas desta obra. Peça para reenviar o PDF.')
      }
      return comTexto
    },
  })
}