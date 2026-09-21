import type { StatusLeitura } from '@tcc-sistema/types'

export const XP_CONCLUIDO = 100
export const XP_EM_ANDAMENTO = 25
export const NIVEL_MAXIMO = 50

export interface LeituraProgresso {
  status_leitura: StatusLeitura
}

export interface AlunoProgressStats {
  obrasExploradas: number
  obrasConcluidas: number
  xp: number
  nivel: number
  xpNoNivel: number
  xpNecessarioNivel: number
  xpParaProximoNivel: number
  progressoNivelPct: number
  nivelMaximo: boolean
  xpTotalProximoNivel: number
}

export interface FaixaNivel {
  id: number
  nome: string
  rotulo: string
  nivelMin: number
  nivelMax: number
  cor: string
  corClara: string
}

export const FAIXAS_NIVEL: FaixaNivel[] = [
  { id: 1, nome: 'Iniciante', rotulo: 'Leitor iniciante', nivelMin: 1, nivelMax: 10, cor: '#1c756a', corClara: '#e8f7f4' },
  { id: 2, nome: 'Aprendiz', rotulo: 'Leitor aprendiz', nivelMin: 11, nivelMax: 20, cor: '#155a52', corClara: '#d4f0ea' },
  { id: 3, nome: 'Explorador', rotulo: 'Explorador de histórias', nivelMin: 21, nivelMax: 30, cor: '#1f7a6e', corClara: '#e3f7f4' },
  { id: 4, nome: 'Construtor', rotulo: 'Construtor de sentidos', nivelMin: 31, nivelMax: 40, cor: '#b45309', corClara: '#fef6e4' },
  { id: 5, nome: 'Mestre', rotulo: 'Entre linhas mestre', nivelMin: 41, nivelMax: 50, cor: '#124a44', corClara: '#f0faf8' },
]

function buildXpThresholds(maxLevel: number): number[] {
  const thresholds: number[] = [0]
  let total = 0
  for (let level = 2; level <= maxLevel; level++) {
    const increment = level === 2 ? XP_CONCLUIDO : Math.round(XP_CONCLUIDO * (1 + (level - 2) * 0.55))
    total += increment
    thresholds.push(total)
  }
  return thresholds
}

const XP_NIVEL_THRESHOLDS = buildXpThresholds(NIVEL_MAXIMO)

function calcularNivelFromXp(xp: number): number {
  let nivel = 1
  for (let i = XP_NIVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_NIVEL_THRESHOLDS[i]!) {
      nivel = i + 1
      break
    }
  }
  return Math.min(NIVEL_MAXIMO, nivel)
}

function xpParaAlcancarNivel(nivel: number): number {
  if (nivel <= 1) return 0
  return XP_NIVEL_THRESHOLDS[nivel - 1] ?? XP_NIVEL_THRESHOLDS[XP_NIVEL_THRESHOLDS.length - 1]!
}

export function calcularProgressoAluno(leituras: LeituraProgresso[]): AlunoProgressStats {
  const obrasExploradas = leituras.filter((l) => l.status_leitura !== 'na_lista').length
  const obrasConcluidas = leituras.filter((l) => l.status_leitura === 'concluido').length
  const emAndamento = leituras.filter((l) => l.status_leitura === 'em_andamento').length
  const xp = obrasConcluidas * XP_CONCLUIDO + emAndamento * XP_EM_ANDAMENTO
  const nivel = calcularNivelFromXp(xp)
  const nivelMaximo = nivel >= NIVEL_MAXIMO
  const xpInicioNivel = xpParaAlcancarNivel(nivel)
  const xpProximoNivel = nivelMaximo ? xp : xpParaAlcancarNivel(nivel + 1)
  const xpNoNivel = xp - xpInicioNivel
  const xpNecessarioNivel = nivelMaximo ? 0 : xpProximoNivel - xpInicioNivel
  const xpParaProximoNivel = nivelMaximo ? 0 : xpNecessarioNivel - xpNoNivel
  const progressoNivelPct = nivelMaximo
    ? 100
    : xpNecessarioNivel > 0
      ? Math.min(100, Math.round((xpNoNivel / xpNecessarioNivel) * 100))
      : 0

  return {
    obrasExploradas,
    obrasConcluidas,
    xp,
    nivel,
    xpNoNivel,
    xpNecessarioNivel,
    xpParaProximoNivel,
    progressoNivelPct,
    nivelMaximo,
    xpTotalProximoNivel: xpProximoNivel,
  }
}

export function faixaDoNivel(nivel: number): FaixaNivel {
  const clamped = Math.min(NIVEL_MAXIMO, Math.max(1, nivel))
  return FAIXAS_NIVEL.find((f) => clamped >= f.nivelMin && clamped <= f.nivelMax) ?? FAIXAS_NIVEL[0]!
}

export function rotuloNivel(nivel: number, nivelMaximo: boolean): string {
  if (nivelMaximo) return `Nível ${NIVEL_MAXIMO} — leitor experiente`
  return `Nível ${nivel}`
}

export function tituloJornada(nivel: number): string {
  return faixaDoNivel(nivel).rotulo
}
