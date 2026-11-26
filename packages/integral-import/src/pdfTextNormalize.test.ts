import { describe, expect, it } from 'vitest'
import {
  fixPdfLineBreakHyphens,
  normalizePdfExtractedPageText,
  normalizeSpacedPdfBannerLines,
} from './pdfTextNormalize'

describe('normalizeSpacedPdfBannerLines', () => {
  it('colapsa CAPÍTULO espaçado', () => {
    expect(normalizeSpacedPdfBannerLines('C A P Í T U L O I I')).toMatch(/^Capítulo\s+II$/i)
  })
})

describe('fixPdfLineBreakHyphens', () => {
  it('junta sílaba cortada por hífen', () => {
    expect(fixPdfLineBreakHyphens('fe-\nchar')).toBe('fechar')
    expect(fixPdfLineBreakHyphens('pessoas\nmoram')).toBe('pessoas\nmoram')
  })
})

describe('normalizePdfExtractedPageText', () => {
  it('não altera frase já correta', () => {
    const t =
      'Agora estavam todos os presentes, exceto Moisés, o corvo domesticado, que dormia num poleiro atrás da porta dos fundos.'
    expect(normalizePdfExtractedPageText(t)).toBe(t)
  })

  it('não parte palavras inteiras', () => {
    const t = 'presentes todos domesticado pessoas'
    expect(normalizePdfExtractedPageText(t)).toBe(t)
  })
})