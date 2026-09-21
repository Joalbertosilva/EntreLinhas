import type { TipoObra } from '@tcc-sistema/types'

export const TIPO_OBRA_LABEL: Record<TipoObra, string> = {
  livro: 'Livro',
  cronica: 'Crônica',
  poema: 'Poema',
}

export const TIPO_OBRA_HINT: Record<TipoObra, string> = {
  livro: 'Capa, capítulos e quantas páginas quiser.',
  cronica: 'Um texto contínuo, como um relato ou artigo.',
  poema: 'Versos livres — escreva no seu ritmo.',
}

export const TIPO_OBRA_EDITOR_PLACEHOLDER: Record<TipoObra, string> = {
  livro: 'Escreva o capítulo aqui…',
  cronica: 'Conte sua história, memória ou reflexão…',
  poema: 'Deixe os versos fluírem…',
}
