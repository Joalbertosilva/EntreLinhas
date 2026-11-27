import type { Conteudo, LicencaLeituraIntegral, StatusLeitura } from '@tcc-sistema/types'

export function conteudoTemLeituraIntegralConfigurada(conteudo: Pick<Conteudo, 'integral_ativa' | 'integral_licenca'>) {
  return Boolean(
    conteudo.integral_ativa && conteudo.integral_licenca === ('dominio_publico' as LicencaLeituraIntegral),
  )
}

export function estudoConcluidoParaIntegral(status: StatusLeitura | null | undefined) {
  return status === 'concluido'
}

export function podeAcessarLeituraIntegral(
  conteudo: Pick<Conteudo, 'integral_ativa' | 'integral_licenca'>,
  statusEstudo: StatusLeitura | null | undefined,
  capitulosCount: number,
) {
  return (
    conteudoTemLeituraIntegralConfigurada(conteudo) &&
    estudoConcluidoParaIntegral(statusEstudo) &&
    capitulosCount > 0
  )
}

export function mensagemLeituraIntegralBloqueada(
  conteudo: Pick<Conteudo, 'integral_ativa' | 'integral_licenca'>,
  statusEstudo: StatusLeitura | null | undefined,
  capitulosCount: number,
): string | null {
  if (!conteudo.integral_ativa) {
    return 'Este material não oferece leitura integral — conclua o estudo com resumo e reflexões.'
  }
  if (conteudo.integral_licenca !== 'dominio_publico') {
    return 'Esta obra não está em domínio público para leitura completa aqui.'
  }
  if (capitulosCount === 0) {
    return 'A leitura integral ainda não foi publicada. Conclua o estudo e volte mais tarde.'
  }
  if (!estudoConcluidoParaIntegral(statusEstudo)) {
    return 'Marque o estudo como concluído para desbloquear a leitura integral.'
  }
  return null
}