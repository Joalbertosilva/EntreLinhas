import type { StatusLeitura } from '@tcc-sistema/types'

export const STATUS_LEITURA_LABEL: Record<StatusLeitura, string> = {
  em_andamento: 'Em andamento',
  na_lista: 'Na lista',
  concluido: 'Concluída',
}
