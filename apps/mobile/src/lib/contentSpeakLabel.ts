import type { TipoConteudo } from '@tcc-sistema/types'
import type { ConteudoCardData } from '@/features/conteudos/useConteudos'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'

export function contentCardSpeakLabel(
  conteudo: Pick<ConteudoCardData, 'tipo' | 'titulo' | 'autor'>,
  leituraStatus?: 'em_andamento' | 'concluido' | 'na_lista' | null,
) {
  const parts: string[] = [TIPO_CONTEUDO_LABEL[conteudo.tipo as TipoConteudo], conteudo.titulo]
  if (conteudo.autor) parts.push(`de ${conteudo.autor}`)
  if (leituraStatus === 'em_andamento') parts.push('Leitura em andamento')
  if (leituraStatus === 'concluido') parts.push('Leitura concluída')
  if (leituraStatus === 'na_lista') parts.push('Na sua lista de leitura')
  return parts.join('. ')
}
