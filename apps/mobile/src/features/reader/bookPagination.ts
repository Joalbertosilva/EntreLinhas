export type BookPageKind = 'text' | 'cover'

export interface BookPage {
  id: string
  title: string
  body: string
  kind?: BookPageKind
  coverUrl?: string | null
  speakLabel?: string
}

export function getBookPageSpeakLabel(page: BookPage): string {
  if (page.speakLabel?.trim()) return page.speakLabel.trim()
  if (page.kind === 'cover') {
    const parts = [page.title, page.body ? `por ${page.body}` : '', 'Capa da leitura integral'].filter(
      Boolean,
    )
    return parts.join('. ')
  }
  return `${page.title}. ${page.body}`
}

/** Uma seção = uma página. Mesmo tamanho de folha para todos os livros. */
export function buildBookPages(
  metaSections: Array<{ label: string; value: string | null | undefined }>,
  texto: string | null | undefined,
  textoPageTitle = 'Texto da leitura',
): BookPage[] {
  const pages: BookPage[] = metaSections
    .filter((s) => s.value?.trim())
    .map((s) => ({
      id: s.label.toLowerCase().replace(/\s+/g, '-'),
      title: s.label,
      body: s.value!.trim(),
    }))

  const textoLimpo = texto?.trim()
  if (textoLimpo) {
    pages.push({
      id: 'texto-da-leitura',
      title: textoPageTitle,
      body: textoLimpo,
    })
  }

  return pages
}

export function getBookPageStorageKey(conteudoId: string): string {
  return `entrelinhas-book-page-${conteudoId}`
}

export function getObraPageStorageKey(obraId: string): string {
  return `entrelinhas-obra-page-${obraId}`
}

export interface ObraCapituloPage {
  id: string
  ordem: number
  titulo: string
  texto: string
}

export function buildObraBookPages(capitulos: ObraCapituloPage[]): BookPage[] {
  return capitulos
    .filter((c) => c.texto?.trim())
    .sort((a, b) => a.ordem - b.ordem)
    .map((c) => ({
      id: c.id,
      title: c.titulo,
      body: c.texto.trim(),
    }))
}

export interface ObraPublicaBookMeta {
  titulo: string
  autorNome?: string | null
  coverUrl?: string | null
  tipoLabel: string
  categoriaLabel?: string | null
  descricao?: string | null
}

function buildObraCreditosBody(meta: ObraPublicaBookMeta, autorDisplay: string): string {
  const lines = [
    `Tipo: ${meta.tipoLabel}`,
    meta.categoriaLabel ? `Categoria: ${meta.categoriaLabel}` : null,
    '',
    'Comunidade EntreLinhas',
    'Espaço onde alunos publicam livros, crônicas, poemas e outros textos para a turma.',
    '',
    `Obra criada por ${autorDisplay}.`,
    meta.descricao?.trim() ? '' : null,
    meta.descricao?.trim() ?? null,
  ].filter((line) => line !== null) as string[]
  return lines.join('\n')
}

/** Obra de aluno: capa → créditos EntreLinhas → capítulos. */
export function buildObraPublicaBookPages(
  meta: ObraPublicaBookMeta,
  capitulos: ObraCapituloPage[],
): BookPage[] {
  const autorDisplay = meta.autorNome?.trim() || 'um aluno da comunidade'
  const capaSpeak = [meta.titulo, `por ${autorDisplay}`, 'Capa da obra do aluno'].filter(Boolean).join('. ')
  const creditosBody = buildObraCreditosBody(meta, autorDisplay)
  const creditosSpeak = [
    'Comunidade EntreLinhas',
    `Obra ${meta.tipoLabel}`,
    meta.categoriaLabel ? `Categoria ${meta.categoriaLabel}` : null,
    `Criada por ${autorDisplay}`,
    meta.descricao?.trim() ?? null,
  ]
    .filter(Boolean)
    .join('. ')

  const prefix: BookPage[] = [
    {
      id: 'obra-aluno-capa',
      kind: 'cover',
      title: meta.titulo,
      body: autorDisplay,
      coverUrl: meta.coverUrl ?? null,
      speakLabel: capaSpeak,
    },
    {
      id: 'obra-aluno-creditos',
      title: 'Comunidade EntreLinhas',
      body: creditosBody,
      speakLabel: creditosSpeak,
    },
  ]

  return [...prefix, ...buildObraBookPages(capitulos)]
}

export interface IntegralBookMeta {
  titulo: string
  autor?: string | null
  coverUrl?: string | null
  creditoTraducao?: string | null
}

export function buildIntegralBookPages(meta: IntegralBookMeta, capitulos: ObraCapituloPage[]): BookPage[] {
  const autor = meta.autor?.trim() ?? ''
  const capaSpeak = [meta.titulo, autor ? `por ${autor}` : '', 'Capa da leitura integral']
    .filter(Boolean)
    .join('. ')

  const prefix: BookPage[] = [
    {
      id: 'integral-capa',
      kind: 'cover',
      title: meta.titulo,
      body: autor,
      coverUrl: meta.coverUrl ?? null,
      speakLabel: capaSpeak,
    },
  ]

  return [...prefix, ...buildObraBookPages(capitulos)]
}

export function getIntegralBookPageStorageKey(conteudoId: string): string {
  return `entrelinhas-integral-page-${conteudoId}`
}
