import type { TipoConteudo, TipoMaterial } from '@tcc-sistema/types'

export const TIPO_CONTEUDO_LABEL: Record<TipoConteudo, string> = {
  livro: 'Livro',
  cronica: 'Crônica',
  poema: 'Poema',
  musica: 'Música',
  frase: 'Frase',
  outro: 'Outro',
}

export const TIPO_MATERIAL_LABEL: Record<TipoMaterial, string> = {
  video: 'Vídeo',
  audio: 'Áudio',
  pagina_externa: 'Página externa',
  outro: 'Outro',
}
