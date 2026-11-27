import type { TipoObra } from '@tcc-sistema/types'
import type { ObraExportCapaImagem } from './capaImagem'

export interface ObraExportCapitulo {
  ordem: number
  titulo: string
  texto: string
}

export interface ObraExportSnapshot {
  titulo: string
  autorNome: string
  tipo: TipoObra
  tipoLabel: string
  categoriaLabel: string
  descricao: string | null
  capitulos: ObraExportCapitulo[]
  geradoEm: Date
  /** Livro com múltiplos capítulos — inclui títulos de bloco no arquivo. */
  estruturarCapitulos: boolean
  /** Imagem da capa conceitual (quando disponível). */
  capa: ObraExportCapaImagem | null
}

export interface ObraCapituloLike {
  id: string
  ordem: number
  titulo: string
  texto: string
}

export function splitTextoEmParagrafos(texto: string): string[] {
  const t = texto.replace(/\r/g, '').trim()
  if (!t) return []
  const blocks = t.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  if (blocks.length > 0) return blocks
  return [t]
}

/** Quebras simples do editor viram parágrafos quando não há linha em branco. */
export function textoParaParagrafosLeitura(texto: string): string[] {
  const t = texto.replace(/\r/g, '').trim()
  if (!t) return []
  if (/\n\s*\n/.test(t)) return splitTextoEmParagrafos(t)
  const lines = t.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length <= 1) return lines
  return [lines.join(' ')]
}

export function obraExportFilename(titulo: string, ext: 'pdf' | 'docx'): string {
  const base =
    titulo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'minha-obra'
  return `${base}.${ext}`
}

export function buildObraExportSnapshot(input: {
  titulo: string
  autorNome: string
  tipo: TipoObra
  tipoLabel: string
  categoriaLabel: string
  descricao: string | null
  capitulos: ObraCapituloLike[]
  geradoEm?: Date
  capa?: ObraExportCapaImagem | null
}): ObraExportSnapshot {
  const capitulos = [...input.capitulos]
    .sort((a, b) => a.ordem - b.ordem)
    .map((c) => ({
      ordem: c.ordem,
      titulo: c.titulo.trim() || (input.tipo === 'livro' ? `Capítulo ${c.ordem}` : 'Texto'),
      texto: c.texto ?? '',
    }))

  return {
    titulo: input.titulo.trim() || 'Minha obra',
    autorNome: input.autorNome.trim() || 'Autor',
    tipo: input.tipo,
    tipoLabel: input.tipoLabel,
    categoriaLabel: input.categoriaLabel,
    descricao: input.descricao?.trim() || null,
    capitulos,
    geradoEm: input.geradoEm ?? new Date(),
    estruturarCapitulos: input.tipo === 'livro' && capitulos.length > 1,
    capa: input.capa ?? null,
  }
}