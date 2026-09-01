import type { TipoConteudo } from '@tcc-sistema/types'

export type AppSectionId =
  | 'home'
  | 'minhas-leituras'
  | 'livros'
  | 'cronicas'
  | 'musicas'
  | 'poemas'
  | 'perfil'

export interface AppNavItem {
  id: AppSectionId
  to: string
  label: string
  description: string
  end?: boolean
  tipo?: TipoConteudo
  placeholderCount?: number
}

/** Links do navbar superior — sem duplicar o menu pill de seções */
export const APP_NAV_HEADER: AppNavItem[] = [
  {
    id: 'home',
    to: '/app',
    label: 'Início',
    description: 'Sua página principal e destaques',
    end: true,
  },
  {
    id: 'minhas-leituras',
    to: '/app/minhas-leituras',
    label: 'Minhas leituras',
    description: 'Em andamento, lista e concluídas',
  },
]

/** Seções de catálogo — menu pill e páginas por tipo */
export const APP_NAV_SECTIONS: AppNavItem[] = [
  {
    id: 'livros',
    to: '/app/livros',
    label: 'Livros',
    description: 'Romances, contos e leituras completas',
    tipo: 'livro',
    placeholderCount: 10,
  },
  {
    id: 'cronicas',
    to: '/app/cronicas',
    label: 'Crônicas',
    description: 'Textos curtos para ler no seu ritmo',
    tipo: 'cronica',
    placeholderCount: 9,
  },
  {
    id: 'musicas',
    to: '/app/musicas',
    label: 'Músicas',
    description: 'Letras e materiais sonoros',
    tipo: 'musica',
    placeholderCount: 8,
  },
  {
    id: 'poemas',
    to: '/app/poemas',
    label: 'Poemas',
    description: 'Versos e reflexões',
    tipo: 'poema',
    placeholderCount: 9,
  },
]

/** Todas as seções navegáveis (drawer mobile) */
export const APP_NAV_MAIN: AppNavItem[] = [...APP_NAV_HEADER, ...APP_NAV_SECTIONS]

export const APP_NAV_ACCOUNT: AppNavItem = {
  id: 'perfil',
  to: '/app/perfil',
  label: 'Minha conta',
  description: 'Dados, senha e preferências',
}

export function getAppRouteForTipo(tipo: TipoConteudo): string {
  const routes: Record<TipoConteudo, string> = {
    livro: '/app/livros',
    cronica: '/app/cronicas',
    musica: '/app/musicas',
    poema: '/app/poemas',
    frase: '/app',
    outro: '/app',
  }
  return routes[tipo]
}

export function resolveSectionId(pathname: string): AppSectionId {
  if (pathname.startsWith('/app/minhas-leituras')) return 'minhas-leituras'
  if (pathname.startsWith('/app/livros')) return 'livros'
  if (pathname.startsWith('/app/cronicas')) return 'cronicas'
  if (pathname.startsWith('/app/musicas')) return 'musicas'
  if (pathname.startsWith('/app/poemas')) return 'poemas'
  if (pathname.startsWith('/app/perfil')) return 'perfil'
  return 'home'
}

export function getNavItem(id: AppSectionId): AppNavItem | undefined {
  if (id === 'perfil') return APP_NAV_ACCOUNT
  return APP_NAV_MAIN.find((item) => item.id === id)
}
