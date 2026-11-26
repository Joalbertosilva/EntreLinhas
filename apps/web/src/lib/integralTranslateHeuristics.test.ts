import { describe, expect, it } from 'vitest'
import {
  capituloPareceJaTraduzido,
  inferirIdiomaOrigemTrecho,
  isIntegralFonteMetadata,
  traducaoPaginaLeitorCacheValida,
} from '@/lib/integralTranslateHeuristics'
import type { ConteudoCapituloIntegral } from '@tcc-sistema/types'

describe('integralTranslateHeuristics', () => {
  it('trata URL em texto_origem como metadado, não como tradução feita', () => {
    const cap = {
      texto_origem: 'https://www.gutenberg.net.au/ebooks03/0300771h.html',
      texto_pt: 'Once upon a time there was a little prince who lived on a planet.',
    } as ConteudoCapituloIntegral
    expect(isIntegralFonteMetadata(cap.texto_origem!)).toBe(true)
    expect(capituloPareceJaTraduzido(cap)).toBe(false)
  })

  it('reconhece capítulo já traduzido (corpo original guardado)', () => {
    const orig =
      'Once upon a time there was a little prince who lived on a planet that was scarcely any bigger than himself.'
    const cap = {
      texto_origem: orig,
      texto_pt:
        'Era uma vez um pequeno príncipe que morava num planeta que não era muito maior do que ele mesmo.',
    } as ConteudoCapituloIntegral
    expect(capituloPareceJaTraduzido(cap)).toBe(true)
  })

  it('rejeita cache igual ao original em inglês', () => {
    const orig = 'Mr. Jones, of the Manor Farm, had locked the hen-houses for the night.'
    expect(
      traducaoPaginaLeitorCacheValida(orig, { titulo: 'Capítulo 1', corpo: orig }, 'en'),
    ).toBe(false)
  })

  it('infere francês em trecho com marcas típicas', () => {
    expect(
      inferirIdiomaOrigemTrecho(
        'Il était une fois un petit prince qui habitait une planète à peine plus grande que lui.',
        'auto',
      ),
    ).toBe('fr')
  })

  it('aceita cache traduzido para português', () => {
    const orig = 'Mr. Jones, of the Manor Farm, had locked the hen-houses for the night.'
    const pt =
      'O Sr. Jones, da Mansão do Sítio, havia trancado os galinheiros para a noite.'
    expect(traducaoPaginaLeitorCacheValida(orig, { titulo: 'Capítulo 1', corpo: pt }, 'en')).toBe(
      true,
    )
  })
})