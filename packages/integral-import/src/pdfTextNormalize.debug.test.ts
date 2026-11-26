import { describe, expect, it } from 'vitest'
import { normalizePdfExtractedPageText } from './pdfTextNormalize'

describe('fidelidade ao texto', () => {
  it('preserva parágrafo sem correções inventadas', () => {
    const raw =
      'Capítulo I\n\nAgora estavam todos os presentes, exceto Moisés, o corvo domesticado.'
    expect(normalizePdfExtractedPageText(raw)).toBe(raw)
  })
})