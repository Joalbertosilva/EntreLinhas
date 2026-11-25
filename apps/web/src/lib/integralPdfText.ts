import { cleanDominioPublicoPdfText } from '@tcc-sistema/integral-import'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

/** Limite alinhado à Edge Function `import-leitura-integral-url`. */
export const INTEGRAL_PDF_MAX_BYTES = 12 * 1024 * 1024

let workerConfigured = false

function ensurePdfWorker() {
  if (workerConfigured) return
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
  workerConfigured = true
}

export function validateIntegralPdfFile(file: File): string | null {
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  const isPdf = type === 'application/pdf' || name.endsWith('.pdf')
  if (!isPdf) return 'Use um arquivo PDF'
  if (file.size > INTEGRAL_PDF_MAX_BYTES) {
    return 'O PDF deve ter no máximo 12 MB'
  }
  return null
}

/** Extrai texto do PDF no navegador (obras em domínio público, ex. MEC). */
export async function extractTextFromIntegralPdf(
  file: File,
  onProgress?: (page: number, total: number) => void,
): Promise<string> {
  const validation = validateIntegralPdfFile(file)
  if (validation) throw new Error(validation)

  ensurePdfWorker()
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await getDocument({ data }).promise
  const chunks: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress?.(pageNum, pdf.numPages)
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => {
        if (!('str' in item) || !item.str) return ''
        const tail = 'hasEOL' in item && item.hasEOL ? '\n' : ' '
        return `${item.str}${tail}`
      })
      .join('')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim()
    if (pageText) chunks.push(pageText)
  }

  const text = cleanDominioPublicoPdfText(chunks.join('\n\n').trim())
  if (text.length < 200) {
    throw new Error(
      'Quase nenhum texto foi lido do PDF. Pode ser só imagem (scan) — use um PDF com texto selecionável do Domínio Público.',
    )
  }
  return text
}