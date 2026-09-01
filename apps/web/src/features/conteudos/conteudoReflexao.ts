import { supabase } from '@/lib/supabase'
import { emptyToNull } from '@/lib/labels'

export interface ReflexaoFields {
  reflexao_tema: string
  reflexao_frase: string
  reflexao_texto: string
  reflexao_pergunta: string
}

export interface ReflexaoParts {
  frase: string
  reflexao: string
  pergunta: string
}

type ReflexaoTemaRow = {
  tema: string
  questionamento: string | null
  descricao: string | null
  ensinamento: string | null
}

/** Separa dados legados em que tudo estava no campo questionamento. */
export function parseLegacyQuestionamento(raw: string): ReflexaoParts | null {
  const text = raw.trim()
  if (!text) return null

  const reflexaoIdx = text.search(/\bReflexão:\s*/i)
  if (reflexaoIdx === -1) return null

  let frase = text.slice(0, reflexaoIdx).trim()
  frase = frase.replace(/^[\s"'""]+|[\s"'""]+$/g, '')

  const after = text.slice(reflexaoIdx).replace(/^Reflexão:\s*/i, '').trim()
  const qStart = after.search(/(?:^|\.\s+)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^.!?]*\?)/)

  if (qStart !== -1) {
    const reflexao = after.slice(0, qStart).trim().replace(/\.\s*$/, '')
    const pergunta = after.slice(qStart).trim().replace(/^\.\s+/, '')
    return { frase, reflexao, pergunta }
  }

  return { frase, reflexao: after, pergunta: '' }
}

/** Normaliza frase, orientação e pergunta — inclusive dados antigos misturados. */
export function normalizeReflexaoParts(tema: ReflexaoTemaRow): ReflexaoParts {
  const descricao = tema.descricao?.trim() ?? ''
  const ensinamento = tema.ensinamento?.trim() ?? ''

  if (descricao || ensinamento) {
    return {
      frase: tema.questionamento?.trim() ?? '',
      reflexao: descricao,
      pergunta: ensinamento || 'O que essa frase desperta em você?',
    }
  }

  const legacy = parseLegacyQuestionamento(tema.questionamento ?? '')
  if (legacy) {
    return {
      frase: legacy.frase,
      reflexao: legacy.reflexao,
      pergunta: legacy.pergunta || 'O que essa frase desperta em você?',
    }
  }

  return {
    frase: tema.questionamento?.trim() ?? '',
    reflexao: '',
    pergunta: ensinamento || 'O que essa frase desperta em você?',
  }
}

/** Carrega tema, frase, orientação e pergunta reflexiva vinculadas ao conteúdo. */
export async function loadReflexaoFields(conteudoId: string): Promise<ReflexaoFields> {
  const { data } = await supabase
    .from('temas')
    .select('tema, questionamento, descricao, ensinamento')
    .eq('conteudo_id', conteudoId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!data) {
    return {
      reflexao_tema: '',
      reflexao_frase: '',
      reflexao_texto: '',
      reflexao_pergunta: '',
    }
  }

  const { frase, reflexao, pergunta } = normalizeReflexaoParts(data)

  return {
    reflexao_tema: data.tema ?? '',
    reflexao_frase: frase,
    reflexao_texto: reflexao,
    reflexao_pergunta: pergunta === 'O que essa frase desperta em você?' ? '' : pergunta,
  }
}

/** Sincroniza reflexão do formulário de conteúdo na tabela temas. */
export async function syncReflexaoTema(
  conteudoId: string,
  reflexaoTema: string | null | undefined,
  reflexaoFrase: string | null | undefined,
  reflexaoTexto: string | null | undefined,
  reflexaoPergunta: string | null | undefined,
): Promise<void> {
  const frase = reflexaoFrase?.trim() ?? ''
  const pergunta = reflexaoPergunta?.trim() ?? ''
  const texto = reflexaoTexto?.trim() ?? ''
  const tema = reflexaoTema?.trim() || 'Reflexão'

  if (!frase) {
    return
  }

  const { data: existing } = await supabase
    .from('temas')
    .select('id')
    .eq('conteudo_id', conteudoId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const payload = {
    conteudo_id: conteudoId,
    tema,
    questionamento: frase,
    descricao: emptyToNull(texto),
    ensinamento: emptyToNull(pergunta),
    status: true,
  }

  if (existing) {
    const { error } = await supabase.from('temas').update(payload).eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('temas').insert(payload)
  if (error) throw error
}

/** Frase (questionamento), orientação (descricao) e pergunta (ensinamento). */
export function getReflexaoDisplay(tema: ReflexaoTemaRow) {
  const { frase, reflexao, pergunta } = normalizeReflexaoParts(tema)

  return { frase, reflexao, pergunta, rotulo: tema.tema?.trim() || 'Reflexão' }
}
