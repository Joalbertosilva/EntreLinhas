import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { capitulosIntegralImportSchema, type CapitulosIntegralImportInput } from '@tcc-sistema/schemas'
import type { ConteudoCapituloIntegral, StatusLeituraIntegral } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { translateCapitulosIntegralNoCliente } from '@/lib/integralMachineTranslate'
import {
  fetchIntegralSourceInBrowser,
  shouldFetchIntegralLinkInBrowser,
} from '@/lib/integralImportFetch'
import { parseIntegralUploadText, persistIntegralImportClient } from '@/lib/integralImportClient'
import { messageFromFunctionsInvokeError } from '@/lib/supabaseFunctionError'
import type { AlunoProgressStats } from '@/features/app/alunoProgress'
import { celebrateIntegralProgressChange } from '@/features/app/progressCelebration'
export function useCapitulosIntegral(conteudoId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['capitulos-integral', conteudoId],
    enabled: Boolean(conteudoId) && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conteudo_capitulos_integral')
        .select('*')
        .eq('conteudo_id', conteudoId!)
        .order('ordem', { ascending: true })
      if (error) throw error
      return data as ConteudoCapituloIntegral[]
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
}

export function useImportLeituraIntegralFromLink(conteudoId: string | undefined) {
  const queryClient = useQueryClient()
  const replaceCapitulos = useReplaceCapitulosIntegral(conteudoId)

  return useMutation({
    mutationFn: async (input: {
      fonteUrl: string
      traduzirParaPt?: boolean
      onTranslateProgress?: (current: number, total: number) => void
    }): Promise<ImportLeituraIntegralLinkResult> => {
      const fonteUrl = input.fonteUrl
      if (!conteudoId) throw new Error('Salve o livro antes de importar')

      const trimmed = fonteUrl.trim()
      if (!trimmed) throw new Error('Cole o link da obra')

      if (isJsonImportUrl(trimmed)) {
        const res = await fetch(trimmed)
        if (!res.ok) throw new Error(`Não foi possível abrir o link (HTTP ${res.status})`)
        const json: unknown = await res.json()
        const parsed = capitulosIntegralImportSchema.parse(json)
        const count = await replaceCapitulos.mutateAsync(parsed)
        const fonteGravada = parsed.meta?.fonte_url?.trim() || trimmed
        await supabase
          .from('conteudos')
          .update({
            integral_fonte_url: fonteGravada,
            integral_traducao_metodo: 'preimportado',
            integral_traducao_credito: 'EntreLinhas',
          })
          .eq('id', conteudoId)
        return { capitulos: count, origem: 'json', idioma: 'pt' }
      }

      let textoBrutoFromBrowser: string | undefined
      if (shouldFetchIntegralLinkInBrowser(trimmed)) {
        try {
          textoBrutoFromBrowser = await fetchIntegralSourceInBrowser(trimmed)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          if (msg === 'Failed to fetch') {
            throw new Error(
              'O site da Cervantes bloqueou a busca automática (CORS). Baixe o PDF do MEC ou copie o HTML da obra.',
            )
          }
          throw e
        }
      }

      if (textoBrutoFromBrowser) {
        const parsed = parseIntegralUploadText(textoBrutoFromBrowser, trimmed)
        const count = await persistIntegralImportClient(conteudoId, parsed, replaceCapitulos)
        queryClient.invalidateQueries({ queryKey: ['capitulos-integral', conteudoId] })
        return {
          capitulos: count,
          idioma: 'pt',
          aviso: 'Texto importado em português. Revise capítulos antes de publicar.',
          origem: 'edge',
        }
      }

      const { data, error } = await supabase.functions.invoke('import-leitura-integral-url', {
        body: {
          conteudo_id: conteudoId,
          fonte_url: trimmed,
          texto_bruto: textoBrutoFromBrowser,
          traduzir_para_pt: input.traduzirParaPt !== false,
        },
      })

      if (error) throw new Error(await messageFromFunctionsInvokeError(error))
      if (data?.error) throw new Error(String(data.error))

      queryClient.invalidateQueries({ queryKey: ['capitulos-integral', conteudoId] })

      if (data?.traduzir_no_cliente && input.traduzirParaPt !== false) {
        const origem = String(data.idioma_detectado ?? data.idioma ?? 'fr')
        await translateCapitulosIntegralNoCliente(conteudoId, origem, input.onTranslateProgress)
        queryClient.invalidateQueries({ queryKey: ['capitulos-integral', conteudoId] })
        return {
          capitulos: Number(data?.capitulos ?? 0),
          idioma: 'pt',
          aviso:
            'Tradução automática para português concluída. Revise capítulos antes do aluno acessar — pode haver imprecisões.',
          origem: 'edge',
        }
      }

      return {
        capitulos: Number(data?.capitulos ?? 0),
        idioma: data?.idioma,
        aviso: data?.aviso ?? null,
        origem: 'edge',
      }
    },
  })
}

export function useImportLeituraIntegralFromTextFile(conteudoId: string | undefined) {
  const queryClient = useQueryClient()
  const replaceCapitulos = useReplaceCapitulosIntegral(conteudoId)

  return useMutation({
    mutationFn: async (input: {
      texto: string
      fonteUrl?: string | null
      traduzirParaPt?: boolean
      onTranslateProgress?: (current: number, total: number) => void
    }): Promise<ImportLeituraIntegralLinkResult> => {
      if (!conteudoId) throw new Error('Salve o livro antes de importar')
      const texto = input.texto.trim()
      if (!texto) throw new Error('Arquivo de texto vazio')

      const parsed = parseIntegralUploadText(texto, input.fonteUrl)
      const count = await persistIntegralImportClient(conteudoId, parsed, replaceCapitulos)
      queryClient.invalidateQueries({ queryKey: ['capitulos-integral', conteudoId] })

      if (input.traduzirParaPt === false) {
        return {
          capitulos: count,
          idioma: 'pt',
          aviso: 'Texto importado em português. Revise capítulos antes do aluno publicar.',
          origem: 'edge',
        }
      }

      return {
        capitulos: count,
        idioma: 'pt',
        aviso: 'Texto importado em português. Revise capítulos antes do aluno acessar.',
        origem: 'edge',
      }
    },
  })
}

export function useReplaceCapitulosIntegral(conteudoId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CapitulosIntegralImportInput) => {
      if (!conteudoId) throw new Error('Conteúdo inválido')

      const { error: delError } = await supabase
        .from('conteudo_capitulos_integral')
        .delete()
        .eq('conteudo_id', conteudoId)
      if (delError) throw delError

      const rows = input.capitulos.map((cap) => ({
        conteudo_id: conteudoId,
        ordem: cap.ordem,
        titulo: cap.titulo.trim(),
        texto_pt: cap.texto_pt.trim(),
        texto_origem: cap.texto_origem?.trim() || null,
      }))

      const { error: insError } = await supabase.from('conteudo_capitulos_integral').insert(rows)
      if (insError) throw insError
      return rows.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capitulos-integral', conteudoId] })
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