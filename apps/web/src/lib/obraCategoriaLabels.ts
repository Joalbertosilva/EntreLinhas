import type { CategoriaObra } from '@tcc-sistema/types'

export const CATEGORIA_OBRA_LABEL: Record<CategoriaObra, string> = {
  biografia: 'Biografia',
  autobiografia: 'Autobiografia',
  ficcao: 'Ficção',
  conto: 'Conto',
  cronica: 'Crônica',
  poesia: 'Poesia',
  memorias: 'Memórias',
  ensaio: 'Ensaio',
  fantasia: 'Fantasia',
  romance: 'Romance',
  misterio: 'Mistério',
  aventura: 'Aventura',
  outro: 'Outro',
}

export const CATEGORIA_OBRA_KICKER: Record<CategoriaObra, string> = {
  biografia: 'MINHA BIOGRAFIA',
  autobiografia: 'MINHA AUTOBIOGRAFIA',
  ficcao: 'FICÇÃO',
  conto: 'CONTO',
  cronica: 'CRÔNICA',
  poesia: 'POESIA',
  memorias: 'MEMÓRIAS',
  ensaio: 'ENSAIO',
  fantasia: 'FANTASIA',
  romance: 'ROMANCE',
  misterio: 'MISTÉRIO',
  aventura: 'AVENTURA',
  outro: 'MINHA OBRA',
}

export const CATEGORIA_OBRA_SUBTITLE: Record<CategoriaObra, string> = {
  biografia: 'Uma breve trajetória',
  autobiografia: 'Minha história',
  ficcao: 'Uma história inventada',
  conto: 'Um relato breve',
  cronica: 'Registro do cotidiano',
  poesia: 'Versos e imagens',
  memorias: 'Lembranças vividas',
  ensaio: 'Reflexões por escrito',
  fantasia: 'Mundos imaginários',
  romance: 'História de amor',
  misterio: 'Enigmas e suspense',
  aventura: 'Jornada e descobertas',
  outro: 'Escrita autoral',
}

/** Categorias sugeridas quando o formato é livro */
export const CATEGORIAS_LIVRO: CategoriaObra[] = [
  'biografia',
  'autobiografia',
  'ficcao',
  'conto',
  'fantasia',
  'romance',
  'misterio',
  'aventura',
  'memorias',
  'ensaio',
  'outro',
]

export const CATEGORIAS_TEXTO: CategoriaObra[] = [
  'cronica',
  'poesia',
  'memorias',
  'ensaio',
  'conto',
  'outro',
]

interface CoverPalette {
  top: string
  mid: string
  bottom: string
  text: string
  accent: string
  frame: string
}

export const CATEGORIA_COVER_PALETTE: Record<CategoriaObra, CoverPalette> = {
  biografia: {
    top: '#eef8f0',
    mid: '#b8dfc4',
    bottom: '#3d7a52',
    text: '#1a4030',
    accent: '#1c756a',
    frame: '#c9a962',
  },
  autobiografia: {
    top: '#f0f6fa',
    mid: '#b8d4e8',
    bottom: '#2a5a7a',
    text: '#1a3342',
    accent: '#1c756a',
    frame: '#c9a962',
  },
  ficcao: {
    top: '#f3eef8',
    mid: '#c4b8df',
    bottom: '#4a3570',
    text: '#2a1a42',
    accent: '#6ec4b5',
    frame: '#efb034',
  },
  conto: {
    top: '#faf6ee',
    mid: '#e8d4b0',
    bottom: '#8a6840',
    text: '#3a2a18',
    accent: '#efb034',
    frame: '#c9a962',
  },
  cronica: {
    top: '#f5f8fa',
    mid: '#c8dce8',
    bottom: '#3a6070',
    text: '#1a3342',
    accent: '#1c756a',
    frame: '#8899aa',
  },
  poesia: {
    top: '#faf0f5',
    mid: '#e0c0d8',
    bottom: '#704060',
    text: '#3a2030',
    accent: '#6ec4b5',
    frame: '#c9a962',
  },
  memorias: {
    top: '#faf8ee',
    mid: '#e0d8b0',
    bottom: '#6a5830',
    text: '#3a3018',
    accent: '#efb034',
    frame: '#c9a962',
  },
  ensaio: {
    top: '#f0f4f8',
    mid: '#b8c8d8',
    bottom: '#3a5060',
    text: '#1a2838',
    accent: '#1c756a',
    frame: '#8899aa',
  },
  fantasia: {
    top: '#eef0fa',
    mid: '#a8b0e0',
    bottom: '#303878',
    text: '#181838',
    accent: '#6ec4b5',
    frame: '#efb034',
  },
  romance: {
    top: '#faf0f0',
    mid: '#e8b8c0',
    bottom: '#883848',
    text: '#401820',
    accent: '#efb034',
    frame: '#c9a962',
  },
  misterio: {
    top: '#eef0f4',
    mid: '#8898a8',
    bottom: '#1a2838',
    text: '#e8ecf0',
    accent: '#6ec4b5',
    frame: '#556070',
  },
  aventura: {
    top: '#f0f8ee',
    mid: '#98c878',
    bottom: '#285830',
    text: '#142818',
    accent: '#efb034',
    frame: '#c9a962',
  },
  outro: {
    top: '#f0faf8',
    mid: '#b8e8df',
    bottom: '#1c756a',
    text: '#1a3342',
    accent: '#efb034',
    frame: '#c9a962',
  },
}
