import type { ConteudoFormInput } from '@tcc-sistema/schemas'
import type { TipoConteudo } from '@tcc-sistema/types'
import { CONTEUDO_TIPOS_PLATAFORMA } from '@tcc-sistema/types'
import { emptyToNull } from '@/lib/labels'

export type PlataformaConteudoTipo = (typeof CONTEUDO_TIPOS_PLATAFORMA)[number]

export type ReflexaoFormVariant = Exclude<PlataformaConteudoTipo, 'video'>

export const REFLEXAO_LABELS: Record<
  ReflexaoFormVariant,
  {
    sectionTitle: string
    sectionHint: string
    trecho: string
    trechoPlaceholder: string
    orientacaoHint: string
    perguntaPlaceholder: string
  }
> = {
  livro: {
    sectionTitle: 'Reflexão do aluno (livro)',
    sectionHint:
      'Trecho do livro, orientação e pergunta. O aluno responde em blocos separados na plataforma.',
    trecho: 'Frase ou trecho do livro',
    trechoPlaceholder: 'Ex.: "Foi o tempo que você passou com sua rosa..."',
    orientacaoHint: 'Texto curto que ajuda quem ainda não consegue refletir só com a frase.',
    perguntaPlaceholder: 'Ex.: Quem é uma pessoa importante para você?',
  },
  cronica: {
    sectionTitle: 'Reflexão do aluno (crônica)',
    sectionHint: 'Trecho da crônica, orientação e pergunta adaptados ao texto curto.',
    trecho: 'Trecho da crônica',
    trechoPlaceholder: 'Cole o trecho que você quer que o aluno reflita.',
    orientacaoHint: 'Orientação breve sobre o que observar no trecho.',
    perguntaPlaceholder: 'Ex.: O que esse momento revela sobre a personagem?',
  },
  poema: {
    sectionTitle: 'Reflexão do aluno (poema)',
    sectionHint: 'Verso ou trecho do poema, orientação e pergunta para a leitura poética.',
    trecho: 'Verso ou trecho do poema',
    trechoPlaceholder: 'Ex.: um verso ou estrofe que será o foco da reflexão.',
    orientacaoHint: 'Como o aluno pode ler imagens, ritmo ou emoção desse trecho.',
    perguntaPlaceholder: 'Ex.: Que sentimento esse verso desperta em você?',
  },
  musica: {
    sectionTitle: 'Reflexão do aluno (música)',
    sectionHint: 'Trecho da letra, orientação e pergunta sobre a música.',
    trecho: 'Trecho da letra',
    trechoPlaceholder: 'Ex.: refrão ou verso que será o foco da reflexão.',
    orientacaoHint: 'Orientação sobre tema, emoção ou mensagem da letra.',
    perguntaPlaceholder: 'Ex.: O que essa letra faz você lembrar ou sentir?',
  },
}

const NULL_TEXT_FIELDS = {
  resumo: null,
  personagens: null,
  contexto: null,
  pontos_importantes: null,
  curiosidades: null,
  conteudo_textual: null,
} as const

export function toDbPayload(
  data: ConteudoFormInput,
  userId: string,
  isEdit: boolean,
  capaUrl: string | null,
): Record<string, unknown> {
  const shared = {
    titulo: data.titulo.trim(),
    tipo: data.tipo,
    autor: emptyToNull(data.autor ?? ''),
    descricao: emptyToNull(data.descricao ?? ''),
    capa_url: capaUrl,
    status: data.status ?? true,
  }

  if (data.tipo === 'video') {
    const video = {
      ...shared,
      ...NULL_TEXT_FIELDS,
      video_url: emptyToNull(data.video_url ?? ''),
      catalog_anchor: data.catalog_anchor ? data.catalog_anchor : null,
      video_categoria: emptyToNull(data.video_categoria ?? ''),
    }
    return isEdit ? video : { ...video, responsavel_id: userId }
  }

  if (data.tipo === 'livro') {
    const livro = {
      ...shared,
      resumo: emptyToNull(data.resumo ?? ''),
      personagens: emptyToNull(data.personagens ?? ''),
      contexto: emptyToNull(data.contexto ?? ''),
      pontos_importantes: emptyToNull(data.pontos_importantes ?? ''),
      curiosidades: emptyToNull(data.curiosidades ?? ''),
      conteudo_textual: emptyToNull(data.conteudo_textual ?? ''),
      video_url: null,
      catalog_anchor: null,
      video_categoria: null,
    }
    return isEdit ? livro : { ...livro, responsavel_id: userId }
  }

  if (data.tipo === 'cronica') {
    const cronica = {
      ...shared,
      resumo: emptyToNull(data.resumo ?? ''),
      personagens: null,
      contexto: emptyToNull(data.contexto ?? ''),
      pontos_importantes: emptyToNull(data.pontos_importantes ?? ''),
      curiosidades: null,
      conteudo_textual: emptyToNull(data.conteudo_textual ?? ''),
      video_url: null,
      catalog_anchor: null,
      video_categoria: null,
    }
    return isEdit ? cronica : { ...cronica, responsavel_id: userId }
  }

  if (data.tipo === 'poema') {
    const poema = {
      ...shared,
      ...NULL_TEXT_FIELDS,
      resumo: emptyToNull(data.resumo ?? ''),
      conteudo_textual: emptyToNull(data.conteudo_textual ?? ''),
      video_url: null,
      catalog_anchor: null,
      video_categoria: null,
    }
    return isEdit ? poema : { ...poema, responsavel_id: userId }
  }

  if (data.tipo === 'musica') {
    const musica = {
      ...shared,
      ...NULL_TEXT_FIELDS,
      resumo: emptyToNull(data.resumo ?? ''),
      conteudo_textual: emptyToNull(data.conteudo_textual ?? ''),
      video_url: emptyToNull(data.video_url ?? ''),
      catalog_anchor: null,
      video_categoria: null,
    }
    return isEdit ? musica : { ...musica, responsavel_id: userId }
  }

  const fallback = {
    ...shared,
    resumo: emptyToNull(data.resumo ?? ''),
    personagens: emptyToNull(data.personagens ?? ''),
    contexto: emptyToNull(data.contexto ?? ''),
    pontos_importantes: emptyToNull(data.pontos_importantes ?? ''),
    curiosidades: emptyToNull(data.curiosidades ?? ''),
    conteudo_textual: emptyToNull(data.conteudo_textual ?? ''),
    video_url: emptyToNull(data.video_url ?? ''),
    catalog_anchor: null,
    video_categoria: null,
  }
  return isEdit ? fallback : { ...fallback, responsavel_id: userId }
}

export function shouldSyncReflexao(tipo: TipoConteudo): tipo is ReflexaoFormVariant {
  return tipo !== 'video'
}
