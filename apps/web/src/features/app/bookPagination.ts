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

export function countBookPages(
  metaSections: Array<{ label: string; value: string | null | undefined }>,
  texto: string | null | undefined,
): number {
  return buildBookPages(metaSections, texto).length
}

export function getBookPageStorageKey(conteudoId: string): string {
  return `entrelinhas-book-page-${conteudoId}`
}
