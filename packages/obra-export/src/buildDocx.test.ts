import { describe, expect, it } from 'vitest'
import { buildObraDocxBase64 } from './buildDocx'
import { buildObraExportSnapshot } from './snapshot'

function base64SampleSnapshot() {
  return buildObraExportSnapshot({
    titulo: 'Pequeno teste',
    autorNome: 'Autor',
    tipo: 'conto',
    tipoLabel: 'Conto',
    categoriaLabel: 'Ficção',
    descricao: 'Sinopse curta.',
    capitulos: [{ id: '1', ordem: 1, titulo: 'Início', texto: 'Era uma vez.\n\nFim.' }],
  })
}

describe('buildObraDocxBase64', () => {
  it('gera DOCX válido (ZIP com assinatura PK)', async () => {
    const b64 = await buildObraDocxBase64(base64SampleSnapshot())
    expect(b64.length).toBeGreaterThan(200)
    const head = atob(b64.slice(0, 8))
    expect(head.startsWith('PK')).toBe(true)
  })

  it('inclui vários capítulos sem erro', async () => {
    const s = buildObraExportSnapshot({
      titulo: 'Livro',
      autorNome: 'Maria',
      tipo: 'livro',
      tipoLabel: 'Livro',
      categoriaLabel: 'Aventura',
      descricao: null,
      capitulos: [
        { id: '1', ordem: 1, titulo: 'Cap 1', texto: 'Texto um.' },
        { id: '2', ordem: 2, titulo: 'Cap 2', texto: 'Texto dois.' },
      ],
    })
    const b64 = await buildObraDocxBase64(s)
    expect(atob(b64.slice(0, 12)).startsWith('PK')).toBe(true)
  })
})