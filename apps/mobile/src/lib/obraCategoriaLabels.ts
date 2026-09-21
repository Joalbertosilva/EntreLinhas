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
