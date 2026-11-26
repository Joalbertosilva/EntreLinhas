import { hasIntegralPageMarkers } from './pageMarkers'

export function countIntegralPdfPages(text: string): number {
  const matches = text.match(/\[\[INTEGRAL_PAG:\d+\]\]|⧗INTEGRAL_PAG:\d+⧗/g)
  return matches?.length ?? 0
}

/** PDF no navegador: sempre 1 folha do arquivo = 1 trecho no leitor. */
export function pdfImportUsaPaginasFisicas(text: string): boolean {
  return hasIntegralPageMarkers(text)
}