import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CategoriaObra, TipoObra, TipoProducao } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

export interface ObraCapitulo {
  id: string
  itemId: string
  ordem: number
  titulo: string
  texto: string
  updated_at: string
}

export interface MinhaObraResumo {
  id: string
  titulo: string
  descricao: string | null
  capa_url: string | null
  tipo: TipoObra
  categoria: CategoriaObra
  curtidas_count: number
  publicado: boolean
  publicado_em: string | null
  updated_at: string
  ultimaProducao: {
    id: string
    titulo: string
    tipo: TipoProducao
    texto: string | null
  } | null
}

export interface MinhaObraEditor extends MinhaObraResumo {
  capitulos: ObraCapitulo[]
}

export interface ObraPublica {
  id: string
  titulo: string
  descricao: string | null
  capa_url: string | null
  tipo: TipoObra
  categoria: CategoriaObra
  curtidas_count: number
  publicado_em: string | null
  autor: { nome: string; nome_usuario: string } | null
  capitulos: ObraCapitulo[]
}

const OBRA_FIELDS =
  'id, titulo, descricao, capa_url, tipo, categoria, curtidas_count, publicado, publicado_em, updated_at'

function producaoTipoForObra(tipo: TipoObra): TipoProducao {
  if (tipo === 'poema') return 'poema'
  if (tipo === 'cronica') return 'cronica'
  return 'capitulo'
}

function tituloBlocoInicial(tipo: TipoObra, ordem: number) {
  if (tipo === 'livro') return ordem === 1 ? 'Capítulo 1' : `Capítulo ${ordem}`
  return 'Texto'
}

async function fetchCapitulos(obraId: string): Promise<ObraCapitulo[]> {
  const { data, error } = await supabase
    .from('obra_itens')
    .select('id, ordem, producoes(id, titulo, texto, updated_at)')
    .eq('obra_id', obraId)
    .eq('status', true)
    .order('ordem', { ascending: true })

  if (error) throw error

  return (data ?? []).flatMap((item) => {
    const p = item.producoes
    const prod = Array.isArray(p) ? p[0] : p
    if (!prod) return []
    return [
      {
        id: prod.id as string,
        itemId: item.id as string,
        ordem: item.ordem as number,
        titulo: (prod.titulo as string) || `Capítulo ${item.ordem}`,
        texto: (prod.texto as string | null) ?? '',
        updated_at: prod.updated_at as string,
      },
    ]
  })
}

async function fetchUltimaProducao(obraId: string) {
  const capitulos = await fetchCapitulos(obraId)
  if (capitulos.length === 0) return null

  const latest = [...capitulos].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )[0]

  return {
    id: latest.id,
    titulo: latest.titulo,
    tipo: 'capitulo' as TipoProducao,
    texto: latest.texto,
  }
}

async function criarCapitulo(userId: string, obraId: string, ordem: number, tipoObra: TipoObra) {
  const { data: producao, error: producaoError } = await supabase
    .from('producoes')
    .insert({
      usuario_id: userId,
      titulo: tituloBlocoInicial(tipoObra, ordem),
      tipo: producaoTipoForObra(tipoObra),
      texto: '',
    })
    .select('id')
    .single()

  if (producaoError) throw producaoError

  const { error: itemError } = await supabase.from('obra_itens').insert({
    obra_id: obraId,
    producao_id: producao.id,
    ordem,
  })

  if (itemError) throw itemError
  return producao.id as string
}

export async function ensureMinhaObra(userId: string, defaultTitle: string) {
  const { data: existing, error: existingError } = await supabase
    .from('obras')
    .select(OBRA_FIELDS)
    .eq('usuario_id', userId)
    .eq('status', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingError) throw existingError

  const tipo = (existing?.tipo as TipoObra | undefined) ?? 'livro'

  if (existing) {
    let capitulos = await fetchCapitulos(existing.id)
    if (capitulos.length === 0) {
      await criarCapitulo(userId, existing.id, 1, tipo)
      capitulos = await fetchCapitulos(existing.id)
    }
    const ultimaProducao = await fetchUltimaProducao(existing.id)
    return { ...existing, tipo, capitulos, ultimaProducao }
  }

  const { data: obra, error: obraError } = await supabase
    .from('obras')
    .insert({
      usuario_id: userId,
      titulo: defaultTitle,
      descricao: null,
      tipo: 'livro',
    })
    .select(OBRA_FIELDS)
    .single()

  if (obraError) throw obraError

  await criarCapitulo(userId, obra.id, 1, 'livro')
  const capitulos = await fetchCapitulos(obra.id)

  return {
    ...obra,
    tipo: obra.tipo as TipoObra,
    capitulos,
    ultimaProducao: capitulos[0]
      ? {
          id: capitulos[0].id,
          titulo: capitulos[0].titulo,
          tipo: 'capitulo' as TipoProducao,
          texto: capitulos[0].texto,
        }
      : null,
  }
}

export function useMinhaObra(userId: string | undefined) {
  return useQuery({
    queryKey: ['minha-obra', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<MinhaObraResumo | null> => {
      const { data: obra, error: obraError } = await supabase
        .from('obras')
        .select(OBRA_FIELDS)
        .eq('usuario_id', userId!)
        .eq('status', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (obraError) throw obraError
      if (!obra) return null

      const ultimaProducao = await fetchUltimaProducao(obra.id)

      return {
        ...obra,
        tipo: obra.tipo as TipoObra,
        categoria: (obra.categoria as CategoriaObra) ?? 'outro',
        curtidas_count: (obra.curtidas_count as number) ?? 0,
        publicado: obra.publicado as boolean,
        publicado_em: obra.publicado_em as string | null,
        ultimaProducao,
      }
    },
  })
}

export function useMinhaObraEditor(userId: string | undefined, defaultTitle: string) {
  return useQuery({
    queryKey: ['minha-obra-editor', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<MinhaObraEditor> => {
      const obra = await ensureMinhaObra(userId!, defaultTitle)
      return {
        id: obra.id,
        titulo: obra.titulo,
        descricao: obra.descricao,
        capa_url: obra.capa_url ?? null,
        tipo: obra.tipo as TipoObra,
        categoria: (obra.categoria as CategoriaObra) ?? 'outro',
        curtidas_count: (obra.curtidas_count as number) ?? 0,
        publicado: obra.publicado as boolean,
        publicado_em: obra.publicado_em as string | null,
        updated_at: obra.updated_at,
        ultimaProducao: obra.ultimaProducao,
        capitulos: obra.capitulos,
      }
    },
  })
}

export function useSalvarObraMeta(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      obraId: string
      titulo: string
      descricao: string | null
      capa_url?: string | null
      tipo?: TipoObra
      categoria?: CategoriaObra
    }) => {
      const { error } = await supabase
        .from('obras')
        .update({
          titulo: input.titulo,
          descricao: input.descricao,
          ...(input.capa_url !== undefined ? { capa_url: input.capa_url } : {}),
          ...(input.tipo !== undefined ? { tipo: input.tipo } : {}),
          ...(input.categoria !== undefined ? { categoria: input.categoria } : {}),
        })
        .eq('id', input.obraId)
        .eq('usuario_id', userId!)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-obra', userId] })
      queryClient.invalidateQueries({ queryKey: ['minha-obra-editor', userId] })
    },
  })
}

export function useSalvarMinhaObra(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      obraId: string
      producaoId: string
      titulo: string
      descricao: string | null
      capituloTitulo: string
      texto: string
    }) => {
      const { error: obraError } = await supabase
        .from('obras')
        .update({
          titulo: input.titulo,
          descricao: input.descricao,
        })
        .eq('id', input.obraId)
        .eq('usuario_id', userId!)

      if (obraError) throw obraError

      const { error: producaoError } = await supabase
        .from('producoes')
        .update({ titulo: input.capituloTitulo, texto: input.texto })
        .eq('id', input.producaoId)
        .eq('usuario_id', userId!)

      if (producaoError) throw producaoError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-obra', userId] })
      queryClient.invalidateQueries({ queryKey: ['minha-obra-editor', userId] })
      queryClient.invalidateQueries({ queryKey: ['obras-publicas'] })
    },
  })
}

export function useAdicionarCapitulo(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ obraId, tipo }: { obraId: string; tipo: TipoObra }) => {
      const capitulos = await fetchCapitulos(obraId)
      const nextOrdem = capitulos.length > 0 ? Math.max(...capitulos.map((c) => c.ordem)) + 1 : 1
      const titulo = tituloBlocoInicial(tipo, nextOrdem)
      const id = await criarCapitulo(userId!, obraId, nextOrdem, tipo)
      return { id, ordem: nextOrdem, titulo }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-obra-editor', userId] })
      queryClient.invalidateQueries({ queryKey: ['minha-obra', userId] })
    },
  })
}

export function usePublicarObra(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (obraId: string) => {
      const { error } = await supabase
        .from('obras')
        .update({
          publicado: true,
          publicado_em: new Date().toISOString(),
        })
        .eq('id', obraId)
        .eq('usuario_id', userId!)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-obra-editor', userId] })
      queryClient.invalidateQueries({ queryKey: ['minha-obra', userId] })
      queryClient.invalidateQueries({ queryKey: ['obras-publicas'] })
    },
  })
}

export function useDespublicarObra(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (obraId: string) => {
      const { error } = await supabase
        .from('obras')
        .update({ publicado: false, publicado_em: null })
        .eq('id', obraId)
        .eq('usuario_id', userId!)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-obra-editor', userId] })
      queryClient.invalidateQueries({ queryKey: ['obras-publicas'] })
    },
  })
}

export function useObrasPublicas(limit = 12) {
  return useQuery({
    queryKey: ['obras-publicas', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obras')
        .select('id, titulo, descricao, capa_url, tipo, categoria, publicado_em, profiles(nome, nome_usuario)')
        .eq('publicado', true)
        .eq('status', true)
        .order('publicado_em', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id as string,
        titulo: row.titulo as string,
        descricao: row.descricao as string | null,
        capa_url: row.capa_url as string | null,
        tipo: row.tipo as TipoObra,
        categoria: (row.categoria as CategoriaObra) ?? 'outro',
        publicado_em: row.publicado_em as string | null,
        autor: Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles,
      }))
    },
  })
}

export function useObraPublica(obraId: string) {
  return useQuery({
    queryKey: ['obra-publica', obraId],
    queryFn: async (): Promise<ObraPublica | null> => {
      const { data: obra, error } = await supabase
        .from('obras')
        .select('id, titulo, descricao, capa_url, tipo, categoria, curtidas_count, publicado_em, profiles(nome, nome_usuario)')
        .eq('id', obraId)
        .eq('publicado', true)
        .eq('status', true)
        .maybeSingle()

      if (error) throw error
      if (!obra) return null

      const capitulos = await fetchCapitulos(obra.id as string)

      return {
        id: obra.id as string,
        titulo: obra.titulo as string,
        descricao: obra.descricao as string | null,
        capa_url: obra.capa_url as string | null,
        tipo: obra.tipo as TipoObra,
        categoria: (obra.categoria as CategoriaObra) ?? 'outro',
        curtidas_count: (obra.curtidas_count as number) ?? 0,
        publicado_em: obra.publicado_em as string | null,
        autor: Array.isArray(obra.profiles) ? obra.profiles[0] ?? null : obra.profiles,
        capitulos,
      }
    },
  })
}

export function countPalavras(texto: string) {
  const trimmed = texto.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function estimatePaginas(palavras: number) {
  if (palavras === 0) return 0
  return Math.max(1, Math.ceil(palavras / 250))
}

export function obraTemConteudo(capitulos: ObraCapitulo[]) {
  return capitulos.some((c) => c.texto.trim().length > 0)
}
