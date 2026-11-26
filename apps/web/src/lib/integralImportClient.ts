import {
  capitulosIntegralImportSchema,
  type CapitulosIntegralImportInput,
} from '@tcc-sistema/schemas'
import {
  inferIntegralDivisaoModo,
  integralImportPareceDegradado,
  hasIntegralPageMarkers,
  isMislabeledPdfAsText,
  parseIntegralTextoBruto,
  type IntegralDivisaoModo,
} from '@tcc-sistema/integral-import'
import { supabase } from '@/lib/supabase'

export const INTEGRAL_TEXTO_MAX_CHARS = 1_500_000

export type IntegralUploadParseResult = {
  parsed: ReturnType<typeof capitulosIntegralImportSchema.parse>
  divisao: IntegralDivisaoModo
  totalPaginasPdf?: number
}

/** `arquivo` = PDF/txt enviado (marcadores de página são normais); `link` = conteúdo baixado por URL. */
export type IntegralUploadOrigem = 'arquivo' | 'link'

export function parseIntegralUploadText(
  texto: string,
  fonteUrl: string | null | undefined,
  origem: IntegralUploadOrigem = 'link',
): IntegralUploadParseResult {
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
  if (!capitulos || capitulos.length < 1) {
    throw new Error(
      'Não foi possível extrair texto legível deste arquivo ou link. Para HTML, use Cervantes ou Gutenberg Australia; para obras do MEC, envie o PDF.',
    )
  }
  if (integralImportPareceDegradado(capitulos)) {
    const host = (() => {
      try {
        return new URL(fonteUrl?.trim() ?? '').hostname
      } catch {
        return ''
      }
    })()
    const dicaGutenberg =
      host.includes('gutenberg.org') && !host.includes('gutenberg.net.au')
        ? ' O site gutenberg.org pode estar em manutenção — use o link .html do gutenberg.net.au ou envie o .txt/.pdf.'
        : ' Use a página HTML da obra (não a vitrine do livro) ou envie PDF/.txt.'
    throw new Error(
      `A divisão da obra falhou (capítulos não detectados ou só “Página 1/2”). Use o .html da obra no Gutenberg Australia ou envie PDF/.txt.${dicaGutenberg}`,
    )
  }

  const parsed = capitulosIntegralImportSchema.parse({
    meta: fonteUrl?.trim() ? { fonte_url: fonteUrl.trim() } : undefined,
    capitulos: capitulos.map((c) => ({
      ordem: c.ordem,
      titulo: c.titulo,
      texto_pt: c.texto_pt,
      texto_origem: c.texto_origem ?? undefined,
    })),
  })
  const pdfPageMatches = texto.match(/\[\[INTEGRAL_PAG:\d+\]\]|⧗INTEGRAL_PAG:\d+⧗/g)
  return {
    parsed,
    divisao: inferIntegralDivisaoModo(parsed.capitulos),
    totalPaginasPdf: pdfPageMatches?.length,
  }
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
      integral_ativa: true,
      integral_licenca: 'dominio_publico',
      integral_fonte_url: fonteGravada,
      integral_traducao_metodo: 'nao_aplicavel',
      integral_traducao_credito: 'Idioma original — use «Traduzir para português» na importação',
    })
    .eq('id', conteudoId)

  if (error) throw new Error(error.message)
  return count
}