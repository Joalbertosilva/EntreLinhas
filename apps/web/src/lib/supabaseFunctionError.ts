import { FunctionsHttpError } from '@supabase/supabase-js'

export async function messageFromFunctionsInvokeError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string }
      if (body?.error) return body.error
    } catch {
      /* ignore */
    }
    return error.message
  }
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') {
      return (
        'Não foi possível falar com o servidor (rede ou função na nuvem). Para PDF/.txt, use Enviar arquivo — o texto é processado no navegador. ' +
        'Se foi Importar do link, rode: pnpm exec supabase functions deploy import-leitura-integral-url'
      )
    }
    return error.message
  }
  return 'Falha na chamada ao servidor'
}