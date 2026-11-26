import { FunctionsHttpError } from '@supabase/supabase-js'

const TRANSLATE_FN_HINT =
  'pnpm exec supabase functions deploy translate-integral-capitulos'

const LINK_FN_HINT =
  'pnpm exec supabase functions deploy fetch-integral-link import-leitura-integral-url'

export async function messageFromFunctionsInvokeError(
  error: unknown,
  functionName?: string,
): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string }
      if (body?.error) return body.error
    } catch {
      /* ignore */
    }
    if (error.context.status === 404) {
      if (functionName === 'translate-integral-capitulos') {
        return `Função de tradução ainda não está na nuvem. Rode: ${TRANSLATE_FN_HINT}`
      }
      return `Função na nuvem não encontrada (${functionName ?? 'edge function'}).`
    }
    return error.message
  }
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') {
      if (functionName === 'translate-integral-capitulos') {
        return (
          'Tradução automática só roda no servidor (o navegador não consegue chamar o Google Translate). ' +
          `Verifique login e sessão; se persistir, rode: ${TRANSLATE_FN_HINT}`
        )
      }
      return (
        'Não foi possível falar com o servidor (rede ou função na nuvem). Para PDF/.txt, use Enviar arquivo — o texto é processado no navegador. ' +
        `Se foi Importar do link, rode: ${LINK_FN_HINT}`
      )
    }
    return error.message
  }
  return 'Falha na chamada ao servidor'
}