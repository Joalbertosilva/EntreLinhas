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
