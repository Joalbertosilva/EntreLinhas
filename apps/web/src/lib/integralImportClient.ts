import {
  capitulosIntegralImportSchema,
  type CapitulosIntegralImportInput,
} from '@tcc-sistema/schemas'
import { isMislabeledPdfAsText, parseIntegralTextoBruto } from '@tcc-sistema/integral-import'
import { supabase } from '@/lib/supabase'

export const INTEGRAL_TEXTO_MAX_CHARS = 1_500_000

export function parseIntegralUploadText(
  texto: string,
  fonteUrl: string | null | undefined,
): ReturnType<typeof capitulosIntegralImportSchema.parse> {
  if (texto.length > INTEGRAL_TEXTO_MAX_CHARS) {
    throw new Error('Arquivo de texto grande demais para importar.')
  }
  if (isMislabeledPdfAsText(texto)) {
    throw new Error(
      'Esse .txt é o PDF em código bruto (%PDF). Envie o arquivo com extensão .pdf — a extração é automática.',
    )
  }

  const capitulos = parseIntegralTextoBruto(
    texto,
    fonteUrl?.trim() ?? '',
    'Arquivo enviado pelo professor',
  )
  if (!capitulos?.length) {
    throw new Error(
      'Não foi possível dividir a obra em capítulos. Confira se o PDF tem texto selecionável ou use o link da Cervantes.',
    )
  }

  return capitulosIntegralImportSchema.parse({
    meta: fonteUrl?.trim() ? { fonte_url: fonteUrl.trim() } : undefined,
    capitulos: capitulos.map((c) => ({
      ordem: c.ordem,
      titulo: c.titulo,
      texto_pt: c.texto_pt,
      texto_origem: c.texto_origem ?? undefined,
    })),
  })
}

/** Grava capítulos no Supabase sem depender da Edge Function (evita “Failed to fetch”). */
export async function persistIntegralImportClient(
  conteudoId: string,
  parsed: ReturnType<typeof capitulosIntegralImportSchema.parse>,
  replaceCapitulos: {
    mutateAsync: (input: CapitulosIntegralImportInput) => Promise<number>
  },
): Promise<number> {
  const count = await replaceCapitulos.mutateAsync(parsed)

  const fonteGravada = parsed.meta?.fonte_url?.trim() || 'arquivo:obra'
  const { error } = await supabase
    .from('conteudos')
    .update({
      integral_fonte_url: fonteGravada,
      integral_traducao_metodo: 'pt_nativo',
      integral_traducao_credito: 'Domínio público / importação no navegador',
    })
    .eq('id', conteudoId)

  if (error) throw new Error(error.message)
  return count
}