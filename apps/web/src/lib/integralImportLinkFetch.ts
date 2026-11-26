import { supabase } from '@/lib/supabase'
import {
  fetchIntegralSourceInBrowser,
  shouldFetchIntegralLinkInBrowser,
} from '@/lib/integralImportFetch'
import {
  MIN_OBRA_TEXTO_CHARS,
  obraIntegralTextoPareceCompleto,
} from '@tcc-sistema/integral-import'
import { messageFromFunctionsInvokeError } from '@/lib/supabaseFunctionError'

export type IntegralLinkRawFetch = {
  texto: string
  fonteUrlEfetiva: string
}

const EDGE_FETCH_FUNCTIONS = ['fetch-integral-link', 'import-leitura-integral-url'] as const

function pickTextoFromEdgePayload(data: Record<string, unknown> | null): string {
  if (!data) return ''
  const bruto = data.texto_bruto ?? data.texto
  return typeof bruto === 'string' ? bruto.trim() : ''
}

function isLegacyEdgeParseResponse(data: Record<string, unknown> | null): boolean {
  if (!data?.ok) return false
  const texto = pickTextoFromEdgePayload(data)
  if (texto.length >= MIN_OBRA_TEXTO_CHARS) return false
  return typeof data.capitulos === 'number'
}

async function baixarViaEdge(
  fonteUrl: string,
  functionName: (typeof EDGE_FETCH_FUNCTIONS)[number],
): Promise<IntegralLinkRawFetch | null> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: {
      fonte_url: fonteUrl,
      somente_baixar: true,
    },
  })

  if (error) {
    const msg = await messageFromFunctionsInvokeError(error)
    if (msg.includes('Failed to fetch') || msg.includes('função na nuvem')) throw new Error(msg)
    return null
  }

  const record = data as Record<string, unknown> | null
  if (record?.error) throw new Error(String(record.error))

  if (isLegacyEdgeParseResponse(record)) {
    throw new Error(
      'A função na nuvem está desatualizada e tentou importar sem o HTML completo. Rode no projeto: pnpm exec supabase functions deploy fetch-integral-link import-leitura-integral-url',
    )
  }

  const texto = pickTextoFromEdgePayload(record)
  if (!obraIntegralTextoPareceCompleto(texto)) return null

  return {
    texto,
    fonteUrlEfetiva: String(record?.fonte_url_efetiva ?? fonteUrl),
  }
}

/** Baixa o HTML/.txt da obra — servidor primeiro (CORS), navegador só se vier obra completa. */
export async function fetchIntegralObraRaw(
  linkUrl: string,
  _conteudoId?: string,
): Promise<IntegralLinkRawFetch> {
  const trimmed = linkUrl.trim()
  if (!trimmed) throw new Error('Cole o link da obra')

  let lastEdgeError: string | null = null
  for (const fn of EDGE_FETCH_FUNCTIONS) {
    try {
      const got = await baixarViaEdge(trimmed, fn)
      if (got) return got
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes('desatualizada') || e.message.includes('deploy')) throw e
        lastEdgeError = e.message
      }
    }
  }

  if (shouldFetchIntegralLinkInBrowser(trimmed)) {
    try {
      const texto = await fetchIntegralSourceInBrowser(trimmed)
      if (obraIntegralTextoPareceCompleto(texto)) {
        return { texto, fonteUrlEfetiva: trimmed }
      }
    } catch {
      /* servidor */
    }
  }

  throw new Error(
    lastEdgeError ??
      'Não foi possível baixar a obra completa. Use o link .html do gutenberg.net.au, envie o arquivo .html salvo da página, ou rode: pnpm exec supabase functions deploy fetch-integral-link',
  )
}