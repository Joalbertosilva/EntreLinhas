import type { TipoConteudo, TipoMaterial } from '@tcc-sistema/types'

export const TIPO_CONTEUDO_LABEL: Record<TipoConteudo, string> = {
  livro: 'Livro',
  cronica: 'Crônica',
  poema: 'Poema',
  musica: 'Música',
  video: 'Vídeo',
  frase: 'Frase',
  outro: 'Outro',
}

/** Título da seção do texto principal na leitura (poema/crônica usam só o nome do tipo). */
export function conteudoTextoPrincipalLabel(tipo: TipoConteudo): string {
  if (tipo === 'poema' || tipo === 'cronica') {
    return TIPO_CONTEUDO_LABEL[tipo]
  }
  return 'Texto da leitura'
}

export const TIPO_MATERIAL_LABEL: Record<TipoMaterial, string> = {
  video: 'Vídeo',
  audio: 'Áudio',
  pagina_externa: 'Página externa',
  outro: 'Outro',
}
