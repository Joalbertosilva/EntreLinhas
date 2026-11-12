import type { TextStyle } from 'react-native'

/** Parágrafos de leitura — alinhamento justificado (livros, crônicas, obras). */
export const READER_PARAGRAPH_STYLE: TextStyle = {
  textAlign: 'justify',
}

export const READER_PARAGRAPH_TEXT_PROPS = {
  className: 'font-sans text-base leading-relaxed text-text',
  style: READER_PARAGRAPH_STYLE,
} as const
