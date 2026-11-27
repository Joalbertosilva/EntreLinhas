/** Texto fixo da folha de agradecimentos no export da obra. */
export function paragrafosAgradecimentoEntreLinhas(autorNome: string): string[] {
  return [
    'Esta obra foi escrita no EntreLinhas, uma plataforma de leitura e escrita pensada para aproximar estudantes da literatura, da autoria e do prazer de contar histórias.',
    `Agradecemos a você, ${autorNome}, por dedicar tempo e imaginação a este texto. Cada obra criada aqui fortalece nossa comunidade escolar e abre espaço para novas vozes.`,
    'No EntreLinhas, você encontra leituras integrais, reflexões, ferramentas acessíveis e o espaço Minha obra — onde este arquivo teve origem. Nosso objetivo é tornar a leitura e a escrita mais acolhedoras, organizadas e possíveis no dia a dia.',
    'Que esta leitura te acompanhe onde você for. Boa leitura!',
    '— EntreLinhas',
  ]
}