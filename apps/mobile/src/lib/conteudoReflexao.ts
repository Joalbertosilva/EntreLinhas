type ReflexaoTemaRow = {
  tema: string
  questionamento: string | null
  descricao: string | null
  ensinamento: string | null
}

function parseLegacyQuestionamento(raw: string) {
  const text = raw.trim()
  if (!text) return null
  const reflexaoIdx = text.search(/\bReflexão:\s*/i)
  if (reflexaoIdx === -1) return null
  let frase = text.slice(0, reflexaoIdx).trim().replace(/^[\s"'""]+|[\s"'""]+$/g, '')
  const after = text.slice(reflexaoIdx).replace(/^Reflexão:\s*/i, '').trim()
  const qStart = after.search(/(?:^|\.\s+)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^.!?]*\?)/)
  if (qStart !== -1) {
    return {
      frase,
      reflexao: after.slice(0, qStart).trim().replace(/\.\s*$/, ''),
      pergunta: after.slice(qStart).trim().replace(/^\.\s+/, ''),
    }
  }
  return { frase, reflexao: after, pergunta: '' }
}

function normalizeReflexaoParts(tema: ReflexaoTemaRow) {
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

export function getReflexaoDisplay(tema: ReflexaoTemaRow) {
  const { frase, reflexao, pergunta } = normalizeReflexaoParts(tema)
  return { frase, reflexao, pergunta, rotulo: tema.tema?.trim() || 'Reflexão' }
}
