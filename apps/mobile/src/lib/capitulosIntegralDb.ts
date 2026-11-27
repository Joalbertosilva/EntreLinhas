import type { ConteudoCapituloIntegral } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

const LIST_PAGE_SIZE = 200

function isIntegralTableMissing(error: { message?: string; code?: string }): boolean {
  const msg = error.message?.toLowerCase() ?? ''
  return (
    error.code === '42P01' ||
    msg.includes('conteudo_capitulos_integral') ||
    msg.includes('does not exist')
  )
}

export type CapituloIntegralLista = Pick<
  ConteudoCapituloIntegral,
  'id' | 'conteudo_id' | 'ordem' | 'titulo'
>

export async function listCapitulosIntegral(conteudoId: string): Promise<CapituloIntegralLista[]> {
  const all: CapituloIntegralLista[] = []
  let from = 0

  for (;;) {
    const to = from + LIST_PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('conteudo_capitulos_integral')
      .select('id, conteudo_id, ordem, titulo')
      .eq('conteudo_id', conteudoId)
      .order('ordem', { ascending: true })
      .range(from, to)

    if (error) {
      if (isIntegralTableMissing(error)) return []
      throw error
    }
    if (!data?.length) break
    all.push(...(data as CapituloIntegralLista[]))
    if (data.length < LIST_PAGE_SIZE) break
    from += LIST_PAGE_SIZE
  }

  return all
}

export async function listCapitulosIntegralComTexto(conteudoId: string): Promise<ConteudoCapituloIntegral[]> {
  const all: ConteudoCapituloIntegral[] = []
  let from = 0

  for (;;) {
    const to = from + LIST_PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('conteudo_capitulos_integral')
      .select('*')
      .eq('conteudo_id', conteudoId)
      .order('ordem', { ascending: true })
      .range(from, to)

    if (error) {
      if (isIntegralTableMissing(error)) return []
      throw error
    }
    if (!data?.length) break
    all.push(...(data as ConteudoCapituloIntegral[]))
    if (data.length < LIST_PAGE_SIZE) break
    from += LIST_PAGE_SIZE
  }

  return all
}