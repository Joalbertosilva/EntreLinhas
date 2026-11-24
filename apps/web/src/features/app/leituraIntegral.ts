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
    return 'Este material não oferece leitura integral na plataforma — você pode concluir o estudo com resumo e reflexões.'
  }
  if (conteudo.integral_licenca !== 'dominio_publico') {
    return 'Esta obra não está disponível em domínio público para leitura completa aqui. Você ainda pode concluir a etapa de estudo.'
  }
  if (capitulosCount === 0) {
    return 'A leitura integral ainda não foi publicada pela equipe. Conclua o estudo e volte mais tarde.'
  }
  if (!estudoConcluidoParaIntegral(statusEstudo)) {
    return 'Conclua a etapa de estudo (marque como concluída) para desbloquear a leitura integral.'
  }
  return null
}