import { describe, expect, it } from 'vitest'
import {
  fixPdfLineBreakHyphens,
  normalizePdfExtractedPageText,
  normalizeSpacedPdfBannerLines,
  reflowPdfParagraphLines,
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

describe('reflowPdfParagraphLines', () => {
  it('reflow do Príncipe Feliz: parágrafos corridos, títulos e travessões', () => {
    const raw = `Página 3
A estátua do Príncipe Feliz
erguia-se bem alto, acima da
cidade. Era coberta de ouro, os
olhos eram duas pedras azuis
brilhantes, e uma joia vermelha
pendia da sua cintura. Todo
mundo achava que ela era muito
bonita.

— Por que você não é como o
Príncipe Feliz? — diziam as
mães aos filhos, quando eles choravam.

Homens tristes olhavam para a
estátua e diziam:

— Ainda bem que existe alguém
feliz neste mundo.`

    const out = reflowPdfParagraphLines(raw)
    expect(out).toContain('Página 3\n\nA estátua do Príncipe Feliz')
    expect(out).toContain(
      'erguia-se bem alto, acima da cidade. Era coberta de ouro, os olhos eram duas pedras azuis brilhantes',
    )
    expect(out).toContain('— Por que você não é como o Príncipe Feliz? — diziam as mães aos filhos')
    expect(out).toContain('Homens tristes olhavam para a estátua e diziam:')
    expect(out).toContain('— Ainda bem que existe alguém feliz neste mundo.')
    expect(out.split('\n\n').some((p) => p.includes('erguia-se') && !p.includes('\n'))).toBe(true)
  })
})