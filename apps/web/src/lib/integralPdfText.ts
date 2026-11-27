import {
  cleanDominioPublicoPdfPageText,
  integralPageMarker,
} from '@tcc-sistema/integral-import'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

/** Item de texto na API do pdfjs (tipos do pacote variam entre builds ESM). */
type PdfTextItem = {
  str: string
  width: number
  height: number
  transform: number[]
}

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

const LINE_Y_TOLERANCE = 5

type PositionedChunk = {
  str: string
  x: number
  y: number
  w: number
  fontSize: number
  hasEOL: boolean
}

function fontSizeFromTransform(transform: number[] | undefined): number {
  if (!transform || transform.length < 4) return 12
  const a = Math.abs(transform[0] ?? 0)
  const d = Math.abs(transform[3] ?? 0)
  return Math.max(a, d, 1)
}

function estimateItemWidth(item: PdfTextItem, fontSize: number): number {
  if (typeof item.width === 'number' && item.width > 0) return item.width
  const len = item.str?.length ?? 1
  return len * fontSize * 0.48
}

/**
 * Espaço entre fragmentos só quando o PDF deixa um “vão” típico de palavra.
 * Evita inventar espaço no meio da palavra (ex.: “pess” + “oas”) nem colar duas palavras.
 */
function spacerBetweenChunks(
  prev: PositionedChunk | null,
  next: PositionedChunk,
  lineSoFar: string,
): string {
  if (!prev || lineSoFar.length === 0) return ''
  if (lineSoFar.endsWith(' ') || next.str.startsWith(' ')) return ''

  const gap = next.x - (prev.x + prev.w)
  const refSize = Math.max(prev.fontSize, next.fontSize)
  const wordSpace = refSize * 0.3
  const maxIntraWord = refSize * 0.2

  if (gap >= wordSpace) return ' '
  if (gap <= maxIntraWord) return ''
  if (/[\s\-–—]$/.test(lineSoFar)) return ' '
  if (/^[\s,.;:!?…\-–—]/.test(next.str)) return ''
  return gap > maxIntraWord ? ' ' : ''
}

function pageTextFromPdfItems(items: unknown[]): string {
  const chunks: PdfTextItem[] = items.filter(
    (item): item is PdfTextItem => typeof item === 'object' && item !== null && 'str' in item,
  )

  const positioned: PositionedChunk[] = chunks
    .map((item) => {
      const fontSize = fontSizeFromTransform(item.transform)
      const w = estimateItemWidth(item, fontSize)
      return {
        str: item.str ?? '',
        x: item.transform?.[4] ?? 0,
        y: item.transform?.[5] ?? 0,
        w,
        fontSize,
        hasEOL: 'hasEOL' in item && Boolean(item.hasEOL),
      }
    })
    .filter((item) => item.str.length > 0)

  positioned.sort((a, b) => {
    if (Math.abs(a.y - b.y) > LINE_Y_TOLERANCE) return b.y - a.y
    return a.x - b.x
  })

  const lines: string[] = []
  let currentY: number | null = null
  let line = ''
  let prevOnLine: PositionedChunk | null = null

  for (const item of positioned) {
    if (currentY !== null && Math.abs(item.y - currentY) > LINE_Y_TOLERANCE) {
      if (line.trim()) lines.push(line.trim())
      line = ''
      prevOnLine = null
    }
    currentY = item.y

    const spacer = spacerBetweenChunks(prevOnLine, item, line)
    line += `${spacer}${item.str}`
    prevOnLine = item

    if (item.hasEOL && line.trim()) {
      lines.push(line.trim())
      line = ''
      prevOnLine = null
      currentY = null
    }
  }
  if (line.trim()) lines.push(line.trim())

  return lines.join('\n')
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
  const parts: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress?.(pageNum, pdf.numPages)
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = cleanDominioPublicoPdfPageText(pageTextFromPdfItems(content.items))
    parts.push(integralPageMarker(pageNum))
    parts.push(pageText || '')
  }

  const text = parts.join('').trim()
  if (text.replace(/\[\[INTEGRAL_PAG:\d+\]\]/g, '').replace(/⧗INTEGRAL_PAG:\d+⧗/g, '').length < 200) {
    throw new Error(
      'Quase nenhum texto foi lido do PDF. Pode ser só imagem (scan) — use um PDF com texto selecionável do Domínio Público.',
    )
  }
  return text
}