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
  if (error instanceof Error) return error.message
  return 'Falha na chamada ao servidor'
}