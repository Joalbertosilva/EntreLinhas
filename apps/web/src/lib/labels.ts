import type { TipoConteudo, TipoMaterial } from '@tcc-sistema/types'

export const TIPO_CONTEUDO_LABEL: Record<TipoConteudo, string> = {
  livro: 'Livro',
  cronica: 'Crônica',
  poema: 'Poema',
  musica: 'Música',
  frase: 'Frase',
  outro: 'Outro',
}

export const TIPO_CONTEUDO_ICON_COLOR: Record<TipoConteudo, string> = {
  livro: 'bg-primary-light text-primary',
  cronica: 'bg-accent-light text-[#5c4800]',
  poema: 'bg-violet-50 text-violet-600',
  musica: 'bg-pink-50 text-pink-600',
  frase: 'bg-teal-50 text-teal-600',
  outro: 'bg-slate-100 text-slate-600',
}

export const TIPO_MATERIAL_LABEL: Record<TipoMaterial, string> = {
  video: 'Vídeo',
  audio: 'Áudio',
  pagina_externa: 'Página externa',
  outro: 'Outro',
}

/** Converte string vazia em null para campos opcionais do banco */
export function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
