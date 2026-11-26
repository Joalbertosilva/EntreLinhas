import {
  translateCapitulosInBrowser,
  type IntegralTranslateProgressFn,
  type TranslateCapitulosIntegralOptions,
} from '@/lib/integralTranslateBrowser'

export async function translateCapitulosIntegralNoCliente(
  conteudoId: string,
  sourceLang: string,
  options?: IntegralTranslateProgressFn | TranslateCapitulosIntegralOptions,
): Promise<number> {
  const { listCapitulosIntegralComTexto } = await import('@/lib/capitulosIntegralDb')
  const caps = await listCapitulosIntegralComTexto(conteudoId)
  if (!caps.length) throw new Error('Nenhum capítulo para traduzir')

  const opts: TranslateCapitulosIntegralOptions =
    typeof options === 'function' ? { onProgress: options, slowMode: true } : { slowMode: true, ...options }

  opts.onProgress?.(0, caps.length)
  return translateCapitulosInBrowser(conteudoId, caps, sourceLang, opts)
}