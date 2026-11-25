/** Arquivo .txt que na verdade é PDF renomeado ou “convertido” de forma errada. */
export function isMislabeledPdfAsText(raw: string): boolean {
  const head = raw.slice(0, 8192).trimStart()
  if (head.startsWith('%PDF-')) return true
  if (/^%PDF-1\.\d/m.test(head)) return true
  if (head.includes('%PDF-1.') && /\\[0-9A-F]{2}/i.test(head.slice(0, 500))) return true
  return false
}

export const MSG_MISLABELED_PDF =
  'Esse .txt é o PDF em código bruto (%PDF…). Salve o arquivo com extensão .pdf e use Enviar arquivo — não renomeie para .txt.'