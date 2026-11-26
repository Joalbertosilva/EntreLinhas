import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { capitulosIntegralImportSchema, type CapitulosIntegralImportInput } from '@tcc-sistema/schemas'
import type { ConteudoCapituloIntegral, StatusLeituraIntegral } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { translateCapitulosIntegralNoCliente } from '@/lib/integralMachineTranslate'
import { inferIntegralDivisaoModo, guessIdiomaIntegralCapitulos, type IntegralDivisaoModo } from '@tcc-sistema/integral-import'
import { parseIntegralUploadText, persistIntegralImportClient } from '@/lib/integralImportClient'
import { fetchIntegralObraRaw } from '@/lib/integralImportLinkFetch'
import type { AlunoProgressStats } from '@/features/app/alunoProgress'
import { celebrateIntegralProgressChange } from '@/features/app/progressCelebration'
import {
  listCapitulosIntegral,
  listCapitulosIntegralComTexto,
  replaceCapitulosIntegralRows,
} from '@/lib/capitulosIntegralDb'

export function invalidateCapitulosIntegralCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conteudoId: string,
) {
  queryClient.invalidateQueries({ queryKey: ['capitulos-integral', conteudoId] })
  queryClient.invalidateQueries({ queryKey: ['capitulos-integral-leitura', conteudoId] })
  queryClient.invalidateQueries({ queryKey: ['app-conteudo', conteudoId] })
  queryClient.removeQueries({ queryKey: ['capitulo-integral-texto'] })
}

export function useCapitulosIntegral(conteudoId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['capitulos-integral', conteudoId],
    enabled: Boolean(conteudoId) && enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      if (!conteudoId) return []
      const lista = await listCapitulosIntegral(conteudoId)
      return lista as ConteudoCapituloIntegral[]
    },
  })
}

function isJsonImportUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.pathname.toLowerCase().endsWith('.json')
  } catch {
    return false
  }
}

export type ImportLeituraIntegralLinkResult = {
  capitulos: number
  idioma?: string
  aviso?: string | null
  origem: 'json' | 'edge'
  divisao?: IntegralDivisaoModo
  totalPaginasPdf?: number
  fonteArquivo?: string | null
}

export async function replaceCapitulosIntegralInDb(
  conteudoId: string,
  input: CapitulosIntegralImportInput,
): Promise<number> {
  const rows = input.capitulos.map((cap) => ({
    conteudo_id: conteudoId,
    ordem: cap.ordem,
    titulo: cap.titulo.trim(),
    texto_pt: cap.texto_pt.trim(),
    texto_origem: cap.texto_origem?.trim() || null,
  }))

  return replaceCapitulosIntegralRows(conteudoId, rows)
}

export function useImportLeituraIntegralFromLink(conteudoId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      conteudoId?: string
      fonteUrl: string
      traduzirParaPt?: boolean
      onTranslateProgress?: (current: number, total: number, detalhe?: string) => void
    }): Promise<ImportLeituraIntegralLinkResult> => {
      const cid = input.conteudoId ?? conteudoId
      if (!cid) throw new Error('Salve o livro antes de importar')
      const replaceAdapter = {
        mutateAsync: (parsed: CapitulosIntegralImportInput) => replaceCapitulosIntegralInDb(cid, parsed),
      }

      const fonteUrl = input.fonteUrl

      const trimmed = fonteUrl.trim()
      if (!trimmed) throw new Error('Cole o link da obra')

      if (isJsonImportUrl(trimmed)) {
        const res = await fetch(trimmed)
        if (!res.ok) throw new Error(`Não foi possível abrir o link (HTTP ${res.status})`)
        const json: unknown = await res.json()
        const parsed = capitulosIntegralImportSchema.parse(json)
        const count = await replaceCapitulosIntegralInDb(cid, parsed)
        const fonteGravada = parsed.meta?.fonte_url?.trim() || trimmed
        await supabase
          .from('conteudos')
          .update({
            integral_fonte_url: fonteGravada,
            integral_traducao_metodo: 'preimportado',
            integral_traducao_credito: 'EntreLinhas',
          })
          .eq('id', cid)
        invalidateCapitulosIntegralCache(queryClient, cid)
        return { capitulos: count, origem: 'json', idioma: 'pt' }
      }

      const { texto, fonteUrlEfetiva } = await fetchIntegralObraRaw(trimmed, cid)
      const { parsed, divisao, totalPaginasPdf } = parseIntegralUploadText(texto, fonteUrlEfetiva, 'link')
      const count = await persistIntegralImportClient(cid, parsed, replaceAdapter)
      invalidateCapitulosIntegralCache(queryClient, cid)

      const idiomaDetectado = guessIdiomaIntegralCapitulos(
        parsed.capitulos.map((c) => ({
          ordem: c.ordem,
          titulo: c.titulo,
          texto_pt: c.texto_pt,
          texto_origem: c.texto_origem ?? null,
        })),
      )

      const querTraduzir = input.traduzirParaPt === true
      if (querTraduzir && idiomaDetectado !== 'pt') {
        const traduzidos = await translateCapitulosIntegralNoCliente(cid, idiomaDetectado, {
          onProgress: input.onTranslateProgress,
          slowMode: true,
        })
        invalidateCapitulosIntegralCache(queryClient, cid)
        const capsTraduzidos = await listCapitulosIntegral(cid)
        return {
          capitulos: capsTraduzidos.length,
          idioma: 'pt',
          aviso:
            traduzidos > 0
              ? 'Tradução automática para português concluída. Revise capítulos antes do aluno acessar — pode haver imprecisões.'
              : 'Importação salva, mas nenhum capítulo novo foi traduzido. Marque “Traduzir para português” e importe de novo.',
          origem: 'edge',
          divisao: inferIntegralDivisaoModo(capsTraduzidos.map((c) => ({ titulo: c.titulo }))),
          totalPaginasPdf,
        }
      }

      return {
        capitulos: count,
        idioma: idiomaDetectado === 'pt' ? 'pt' : idiomaDetectado,
        aviso:
          idiomaDetectado === 'pt'
            ? 'Texto importado em português. Revise capítulos antes de publicar.'
            : querTraduzir
              ? null
              : 'Texto no idioma original. Marque “Traduzir para português” na importação se quiser PT automático.',
        origem: 'edge',
        divisao,
        totalPaginasPdf,
      }
    },
  })
}

export function useImportLeituraIntegralFromTextFile(conteudoId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      conteudoId?: string
      texto: string
      fonteUrl?: string | null
      traduzirParaPt?: boolean
      onTranslateProgress?: (current: number, total: number, detalhe?: string) => void
    }): Promise<ImportLeituraIntegralLinkResult> => {
      const cid = input.conteudoId ?? conteudoId
      if (!cid) throw new Error('Salve o livro antes de importar')
      const texto = input.texto.trim()
      if (!texto) throw new Error('Arquivo de texto vazio')

      const { parsed, divisao, totalPaginasPdf } = parseIntegralUploadText(texto, input.fonteUrl, 'arquivo')
      const replaceAdapter = {
        mutateAsync: (p: CapitulosIntegralImportInput) => replaceCapitulosIntegralInDb(cid, p),
      }
      const count = await persistIntegralImportClient(cid, parsed, replaceAdapter)
      invalidateCapitulosIntegralCache(queryClient, cid)

      const avisoPaginas =
        divisao === 'paginas'
          ? `${totalPaginasPdf ?? count} página(s) na mesma ordem do PDF — revise ortografia antes do aluno ler.`
          : 'Revise os trechos antes do aluno acessar.'

      await supabase
        .from('conteudos')
        .update({
          integral_traducao_metodo: 'pt_nativo',
          integral_traducao_credito: 'Texto original em português (Domínio Público)',
        })
        .eq('id', cid)

      return {
        capitulos: count,
        idioma: 'pt',
        aviso: avisoPaginas,
        origem: 'edge',
        divisao,
        totalPaginasPdf,
      }
    },
  })
}

export function useRetomarTraducaoIntegral(conteudoId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      conteudoId?: string
      idiomaOrigem?: string
      onTranslateProgress?: (current: number, total: number, detalhe?: string) => void
    }): Promise<number> => {
      const cid = input.conteudoId ?? conteudoId
      if (!cid) throw new Error('Salve o livro antes de traduzir')

      const caps = await listCapitulosIntegralComTexto(cid)
      if (!caps.length) throw new Error('Não há capítulos importados para traduzir.')

      const idioma =
        input.idiomaOrigem ??
        guessIdiomaIntegralCapitulos(
          caps.map((c) => ({
            ordem: c.ordem,
            titulo: c.titulo,
            texto_pt: c.texto_pt,
            texto_origem: c.texto_origem ?? null,
          })),
        )

      if (idioma === 'pt') {
        throw new Error('O texto detectado já está em português — tradução não é necessária.')
      }

      const traduzidos = await translateCapitulosIntegralNoCliente(cid, idioma, {
        onProgress: input.onTranslateProgress,
        slowMode: true,
      })

      invalidateCapitulosIntegralCache(queryClient, cid)
      if (traduzidos < 1) {
        throw new Error(
          'Nenhum capítulo pendente foi traduzido. Os que já estão em português foram mantidos.',
        )
      }
      return traduzidos
    },
  })
}

export function useReplaceCapitulosIntegral(conteudoId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CapitulosIntegralImportInput) => {
      if (!conteudoId) throw new Error('Conteúdo inválido')
      return replaceCapitulosIntegralInDb(conteudoId, input)
    },
    onSuccess: () => {
      invalidateCapitulosIntegralCache(queryClient, conteudoId!)
    },
  })
}

export function useAtualizarLeituraIntegral(conteudoId: string, usuarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integral_status: StatusLeituraIntegral) => {
      if (!usuarioId) throw new Error('Sessão inválida')

      const { data: leitura, error: readError } = await supabase
        .from('leituras')
        .select('status_leitura')
        .eq('usuario_id', usuarioId)
        .eq('conteudo_id', conteudoId)
        .maybeSingle()
      if (readError) throw readError
      if (leitura?.status_leitura !== 'concluido') {
        throw new Error('Conclua a etapa de estudo antes da leitura integral')
      }

      const { error } = await supabase
        .from('leituras')
        .update({ integral_status })
        .eq('usuario_id', usuarioId)
        .eq('conteudo_id', conteudoId)
      if (error) throw error
      return integral_status
    },
    onSuccess: async (integral_status) => {
      const prevProgress = usuarioId
        ? queryClient.getQueryData<AlunoProgressStats>(['aluno-progress', usuarioId])
        : undefined
      queryClient.invalidateQueries({ queryKey: ['app-leitura', conteudoId, usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['leituras-map', usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['aluno-progress', usuarioId] })
      if (usuarioId) {
        await celebrateIntegralProgressChange(queryClient, usuarioId, integral_status, prevProgress)
      }
    },
  })
}