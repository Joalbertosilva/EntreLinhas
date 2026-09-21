export interface BookPage {
  id: string
  title: string
  body: string
}

/** Uma seção = uma página. Mesmo tamanho de folha para todos os livros. */
export function buildBookPages(
  metaSections: Array<{ label: string; value: string | null | undefined }>,
  texto: string | null | undefined,
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
      title: 'Texto da leitura',
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
