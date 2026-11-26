import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  integralImportPareceDegradado,
  parseGutenbergAuHtml,
  parseGutenbergOrgHtml,
  parseIntegralFromUrlContent,
  parsePlainTextCapitulos,
} from './index'

describe('Gutenberg AU — âncoras ch01 (padrão inglês)', () => {
  it('usa ch01, ch02… sem virar sumário em capítulos', () => {
    const html = `<html><body><p>Project Gutenberg Australia</p>
<table><tr><td>${'sinopse e créditos '.repeat(12)}</td></tr></table>
<hr><a name="ch01" id="ch01"></a><h3>Primeiro trecho</h3><p>${'texto '.repeat(80)}</p>
<a name="ch02" id="ch02"></a><h3>Segundo trecho</h3><p>${'outro '.repeat(80)}</p>
</body></html>`
    const caps = parseIntegralFromUrlContent('https://gutenberg.net.au/ebooks01/000001h.html', html)
    expect(caps.length).toBeGreaterThanOrEqual(2)
    expect(caps.some((c) => c.titulo === 'Primeiro trecho')).toBe(true)
    expect(caps.some((c) => c.titulo === 'Segundo trecho')).toBe(true)
    expect(caps.every((c) => !/^Página\s/i.test(c.titulo))).toBe(true)
  })
})

describe('Gutenberg AU — Pequeno Príncipe', () => {
  it.skip('divide em capítulos a partir do HTML piloto (fixture local /tmp)', () => {
    const html = readFileSync('/tmp/pp.html', 'utf8')
    const caps = parseGutenbergAuHtml(html, 'teste')
    expect(caps.length).toBeGreaterThanOrEqual(27)
    expect(caps[0]?.titulo).toMatch(/Apresentação/i)
    expect(caps[1]?.titulo).toMatch(/DEDICACE/i)
  })
})

describe('Gutenberg US — Picture of Dorian Gray (archive)', () => {
  it.skip('usa div.chapter em ordem (fixture local /tmp)', () => {
    const html = readFileSync('/tmp/pg174.html', 'utf8')
    const caps = parseGutenbergOrgHtml(html, 'teste')
    expect(caps.length).toBeGreaterThanOrEqual(15)
    expect(caps.some((c) => /Apresentação/i.test(c.titulo) || /PREFACE/i.test(c.titulo))).toBe(true)
    expect(caps.some((c) => /PREFACE/i.test(c.titulo))).toBe(true)
    expect(caps.some((c) => /CHAPTER I/i.test(c.titulo))).toBe(true)
  })
})

describe('PDF — uma folha = um trecho', () => {
  it('preserva marcadores como Página 1, 2, 3…', () => {
    const body = `[[INTEGRAL_PAG:1]]\n\nCHAPTER I\n\n${'word '.repeat(200)}\n\n[[INTEGRAL_PAG:2]]\n\nCHAPTER II\n\n${'other '.repeat(200)}\n\n[[INTEGRAL_PAG:3]]\n\nfim`
    const caps = parsePlainTextCapitulos(body, 'pdf')
    expect(caps.length).toBe(3)
    expect(caps.map((c) => c.titulo)).toEqual(['Página 1', 'Página 2', 'Página 3'])
  })

  it('PDF anotado mantém uma entrada por folha do arquivo', () => {
    const cap = (titulo: string) =>
      `Capítulo ${titulo}\n\nSr. Jones, da Granja do Solar, havia trancado os galinheiros. ${'texto '.repeat(80)}`
    const body = `[[INTEGRAL_PAG:1]]\nSOBRE ESTA EDIÇÃO\n\n[[INTEGRAL_PAG:2]]\nSUMÁRIO\n\n[[INTEGRAL_PAG:3]]\n\n${cap('I')}`
    const caps = parsePlainTextCapitulos(body, 'pdf-animal')
    expect(caps.length).toBe(3)
    expect(caps[0]!.titulo).toBe('Página 1')
    expect(caps[1]!.titulo).toBe('Página 2')
    expect(caps[2]!.titulo).toMatch(/Capítulo\s+I/i)
    expect(caps[2]!.texto_pt).toMatch(/galinheiros/i)
  })
})

describe('integralImportPareceDegradado', () => {
  it('rejeita bloco único curto', () => {
    expect(
      integralImportPareceDegradado([
        { ordem: 1, titulo: 'Texto integral', texto_pt: 'manutenção curta', texto_origem: null },
      ]),
    ).toBe(true)
  })

  it('aceita vários capítulos', () => {
    expect(
      integralImportPareceDegradado([
        { ordem: 1, titulo: 'Cap I', texto_pt: 'a', texto_origem: null },
        { ordem: 2, titulo: 'Cap II', texto_pt: 'b', texto_origem: null },
      ]),
    ).toBe(false)
  })

  it('rejeita duas páginas PDF falsas numa obra longa', () => {
    const long = 'palavra '.repeat(4000)
    expect(
      integralImportPareceDegradado([
        { ordem: 1, titulo: 'Página 1', texto_pt: long, texto_origem: null },
        { ordem: 2, titulo: 'Página 2', texto_pt: long, texto_origem: null },
      ]),
    ).toBe(true)
  })
})