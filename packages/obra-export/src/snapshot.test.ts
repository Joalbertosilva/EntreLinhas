import { describe, expect, it } from 'vitest'
import { buildObraExportSnapshot, textoParaParagrafosLeitura } from './snapshot'

describe('textoParaParagrafosLeitura', () => {
  it('reflow de linhas simples em um parágrafo', () => {
    expect(textoParaParagrafosLeitura('Olá\nmundo')).toEqual(['Olá mundo'])
  })

  it('preserva parágrafos com linha em branco', () => {
    expect(textoParaParagrafosLeitura('A\n\nB')).toEqual(['A', 'B'])
  })
})

describe('buildObraExportSnapshot', () => {
  it('ordena capítulos e marca livro com vários blocos', () => {
    const s = buildObraExportSnapshot({
      titulo: 'Teste',
      autorNome: 'João',
      tipo: 'livro',
      tipoLabel: 'Livro',
      categoriaLabel: 'Ficção',
      descricao: null,
      capitulos: [
        { id: '2', ordem: 2, titulo: 'Cap 2', texto: 'b' },
        { id: '1', ordem: 1, titulo: 'Cap 1', texto: 'a' },
      ],
    })
    expect(s.capitulos.map((c) => c.ordem)).toEqual([1, 2])
    expect(s.estruturarCapitulos).toBe(true)
  })
})