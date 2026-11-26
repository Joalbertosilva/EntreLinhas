import type { ConteudoCapituloIntegral } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

const LIST_PAGE_SIZE = 200
const INSERT_CHUNK_SIZE = 40

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

    if (error) throw error
    if (!data?.length) break
    all.push(...(data as CapituloIntegralLista[]))
    if (data.length < LIST_PAGE_SIZE) break
    from += LIST_PAGE_SIZE
  }

  return all
}

/** Lista completa (não usar na leitura do aluno — resposta grande). */
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

    if (error) throw error
    if (!data?.length) break
    all.push(...(data as ConteudoCapituloIntegral[]))
    if (data.length < LIST_PAGE_SIZE) break
    from += LIST_PAGE_SIZE
  }

  return all
}

export async function fetchCapituloIntegralTexto(capituloId: string): Promise<string> {
  const { data, error } = await supabase
    .from('conteudo_capitulos_integral')
    .select('texto_pt')
    .eq('id', capituloId)
    .single()

  if (error) throw error
  return data.texto_pt
}

export async function replaceCapitulosIntegralRows(
  conteudoId: string,
  rows: Array<{
    conteudo_id: string
    ordem: number
    titulo: string
    texto_pt: string
    texto_origem: string | null
  }>,
): Promise<number> {
  const { error: delError } = await supabase
    .from('conteudo_capitulos_integral')
    .delete()
    .eq('conteudo_id', conteudoId)
  if (delError) throw delError

  const rowsOk = rows.filter((r) => r.texto_pt?.trim() && r.texto_pt.trim().length >= 12)
  const soPaginasPdf =
    rowsOk.length >= 2 &&
    rowsOk.length < 6 &&
    rowsOk.every((r) => /^Página\s+\d+/i.test(r.titulo.trim()))
  const totalChars = rowsOk.reduce((s, r) => s + r.texto_pt.trim().length, 0)
  if (rowsOk.length < 2) {
    throw new Error('Menos de 2 trechos válidos para gravar. Reimporte o PDF ou o link.')
  }
  if (soPaginasPdf && totalChars > 6_000) {
    throw new Error(
      'A obra ficou só em 2 “páginas” — isso indica falha na divisão por capítulos. Reimporte com o link .html da obra ou o PDF.',
    )
  }
  const normalizedRows = rowsOk.map((r, i) => ({ ...r, ordem: i + 1 }))

  for (let i = 0; i < normalizedRows.length; i += INSERT_CHUNK_SIZE) {
    const chunk = normalizedRows.slice(i, i + INSERT_CHUNK_SIZE)
    const { error: insError } = await supabase.from('conteudo_capitulos_integral').insert(chunk)
    if (insError) throw insError
  }

  const { count, error: countError } = await supabase
    .from('conteudo_capitulos_integral')
    .select('id', { count: 'exact', head: true })
    .eq('conteudo_id', conteudoId)

  if (countError) throw countError
  if (count !== normalizedRows.length) {
    const gravados = await listCapitulosIntegral(conteudoId)
    if (gravados.length < 2) {
      throw new Error(
        `A gravação ficou incompleta: esperado ${normalizedRows.length} trechos, gravado ${count ?? gravados.length}. Tente importar de novo.`,
      )
    }
  }

  return normalizedRows.length
}