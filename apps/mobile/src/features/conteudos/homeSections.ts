import type { TipoConteudo } from '@tcc-sistema/types'

export interface HomeSectionConfig {
  id: string
  title: string
  subtitle?: string
  tipo: TipoConteudo
  placeholderCount: number
  catalogAnchor?: 'livros' | 'cronicas' | 'musicas' | 'poemas'
}

/** Seções da home — alinhadas à plataforma web. */
export const HOME_SECTIONS: HomeSectionConfig[] = [
  {
    id: 'destaques',
    title: 'Destaques do EntreLinhas',
    subtitle: 'Livros, crônicas, poemas e músicas mais curtidos',
    tipo: 'livro',
    placeholderCount: 12,
  },
  {
    id: 'livros',
    title: 'Livros',
    subtitle: 'Romances, contos e leituras completas',
    tipo: 'livro',
    placeholderCount: 8,
    catalogAnchor: 'livros',
  },
  {
    id: 'cronicas',
    title: 'Crônicas',
    subtitle: 'Textos curtos para ler no seu ritmo',
    tipo: 'cronica',
    placeholderCount: 8,
    catalogAnchor: 'cronicas',
  },
  {
    id: 'musicas',
    title: 'Músicas',
    subtitle: 'Letras e materiais sonoros',
    tipo: 'musica',
    placeholderCount: 8,
    catalogAnchor: 'musicas',
  },
  {
    id: 'poemas',
    title: 'Poemas',
    subtitle: 'Versos e reflexões',
    tipo: 'poema',
    placeholderCount: 8,
    catalogAnchor: 'poemas',
  },
  {
    id: 'videos',
    title: 'Vídeos',
    subtitle: 'Palestras, entrevistas e reflexões em vídeo',
    tipo: 'video',
    placeholderCount: 8,
  },
]
