import type { TipoConteudo } from '@tcc-sistema/types'

export interface HomeSectionConfig {
  id: string
  title: string
  subtitle?: string
  tipo: TipoConteudo
  placeholderCount: number
  route?: string
}

/** Seções da home — espelha organização por tipo (inspirado em vitrines horizontais). */
export const HOME_SECTIONS: HomeSectionConfig[] = [
  {
    id: 'destaques',
    title: 'Destaques',
    subtitle: 'Mais curtidos pelos alunos',
    tipo: 'livro',
    placeholderCount: 6,
  },
  {
    id: 'livros',
    title: 'Livros',
    subtitle: 'Romances, contos e leituras completas',
    tipo: 'livro',
    placeholderCount: 8,
    route: '/app/livros',
  },
  {
    id: 'cronicas',
    title: 'Crônicas',
    subtitle: 'Textos curtos para ler no seu ritmo',
    tipo: 'cronica',
    placeholderCount: 7,
    route: '/app/cronicas',
  },
  {
    id: 'musicas',
    title: 'Músicas',
    subtitle: 'Letras e materiais sonoros',
    tipo: 'musica',
    placeholderCount: 6,
    route: '/app/musicas',
  },
  {
    id: 'poemas',
    title: 'Poemas',
    subtitle: 'Versos e reflexões',
    tipo: 'poema',
    placeholderCount: 7,
    route: '/app/poemas',
  },
]
