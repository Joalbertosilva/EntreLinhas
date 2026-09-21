import type { StatusLeitura } from '@tcc-sistema/types'

/** Uma obra concluída = exatamente o necessário para sair do nível 1 */
export const XP_CONCLUIDO = 100
/** Explorar (em andamento) dá um pouco de XP, mas menos que concluir */
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

export interface NivelGradiente {
  card: string
  fill: string
  track: string
  badge: string
  glow: string
}

/** Paleta percorrida conforme o nível sobe */
const GRADIENT_STOPS = [
  { t: 0, r: 0, g: 51, b: 102 }, // brand-navy
  { t: 0.22, r: 0, g: 102, b: 204 }, // primary
  { t: 0.48, r: 46, g: 139, b: 192 }, // azul médio
  { t: 0.72, r: 255, g: 209, b: 0 }, // accent
  { t: 1, r: 239, g: 176, b: 52 }, // brand-gold
] as const

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t)
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function corNaEscala(t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const a = GRADIENT_STOPS[i]
    const b = GRADIENT_STOPS[i + 1]
    if (clamped >= a.t && clamped <= b.t) {
      const local = (clamped - a.t) / (b.t - a.t)
      return rgbToHex(lerp(a.r, b.r, local), lerp(a.g, b.g, local), lerp(a.b, b.b, local))
    }
  }
  const last = GRADIENT_STOPS[GRADIENT_STOPS.length - 1]
  return rgbToHex(last.r, last.g, last.b)
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${r} ${g} ${b} / ${alpha})`
}

/** XP acumulado mínimo para cada nível (índice 0 = nível 1) */
export function buildXpThresholds(maxLevel: number): number[] {
  const thresholds: number[] = [0]
  let total = 0

  for (let level = 2; level <= maxLevel; level++) {
    const increment =
      level === 2
        ? XP_CONCLUIDO
        : Math.round(XP_CONCLUIDO * (1 + (level - 2) * 0.55))
    total += increment
    thresholds.push(total)
  }

  return thresholds
}

export const XP_NIVEL_THRESHOLDS = buildXpThresholds(NIVEL_MAXIMO)

export function calcularNivelFromXp(xp: number): number {
  let nivel = 1
  for (let i = XP_NIVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_NIVEL_THRESHOLDS[i]!) {
      nivel = i + 1
      break
    }
  }
  return Math.min(NIVEL_MAXIMO, nivel)
}

export function xpParaAlcancarNivel(nivel: number): number {
  if (nivel <= 1) return 0
  return XP_NIVEL_THRESHOLDS[nivel - 1] ?? XP_NIVEL_THRESHOLDS[XP_NIVEL_THRESHOLDS.length - 1]!
}

export function xpIncrementoProximoNivel(nivel: number): number {
  if (nivel >= NIVEL_MAXIMO) return 0
  return xpParaAlcancarNivel(nivel + 1) - xpParaAlcancarNivel(nivel)
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

/** Gradiente visual do card e da barra — muda a cada nível */
export function gradienteNivel(nivel: number): NivelGradiente {
  const t = (Math.min(NIVEL_MAXIMO, Math.max(1, nivel)) - 1) / (NIVEL_MAXIMO - 1)
  const tNext = Math.min(1, t + 1 / (NIVEL_MAXIMO - 1))

  const cor = corNaEscala(t)
  const corFim = corNaEscala(Math.min(1, t + 0.12))
  const corProxima = corNaEscala(tNext)

  return {
    card: `linear-gradient(145deg, ${rgba(cor, 0.14)} 0%, ${rgba(corFim, 0.06)} 42%, ${rgba(corProxima, 0.1)} 100%)`,
    fill: `linear-gradient(90deg, ${cor} 0%, ${corFim} 100%)`,
    track: `linear-gradient(90deg, ${rgba(corProxima, 0.22)} 0%, ${rgba(corProxima, 0.08)} 100%)`,
    badge: `linear-gradient(135deg, ${cor} 0%, ${corFim} 100%)`,
    glow: rgba(cor, 0.35),
  }
}

export function rotuloNivel(nivel: number, nivelMaximo: boolean): string {
  if (nivelMaximo) return `Nível ${NIVEL_MAXIMO} — leitor experiente`
  return `Nível ${nivel}`
}

export function tituloJornada(nivel: number): string {
  return faixaDoNivel(nivel).rotulo
}

/** Faixas de nível — a cada 10 níveis, cor e título mudam (1–50) */
export interface FaixaNivel {
  id: number
  nome: string
  rotulo: string
  nivelMin: number
  nivelMax: number
  cor: string
  corClara: string
  corBarra: string
}

export const FAIXAS_NIVEL: FaixaNivel[] = [
  {
    id: 1,
    nome: 'Iniciante',
    rotulo: 'Leitor iniciante',
    nivelMin: 1,
    nivelMax: 10,
    cor: '#1c756a',
    corClara: '#e8f7f4',
    corBarra: '#ffffff',
  },
  {
    id: 2,
    nome: 'Aprendiz',
    rotulo: 'Leitor aprendiz',
    nivelMin: 11,
    nivelMax: 20,
    cor: '#155a52',
    corClara: '#d4f0ea',
    corBarra: '#ffffff',
  },
  {
    id: 3,
    nome: 'Explorador',
    rotulo: 'Explorador de histórias',
    nivelMin: 21,
    nivelMax: 30,
    cor: '#1f7a6e',
    corClara: '#e3f7f4',
    corBarra: '#ffffff',
  },
  {
    id: 4,
    nome: 'Construtor',
    rotulo: 'Construtor de sentidos',
    nivelMin: 31,
    nivelMax: 40,
    cor: '#b45309',
    corClara: '#fef6e4',
    corBarra: '#ffffff',
  },
  {
    id: 5,
    nome: 'Mestre',
    rotulo: 'Entre linhas mestre',
    nivelMin: 41,
    nivelMax: 50,
    cor: '#124a44',
    corClara: '#f0faf8',
    corBarra: '#ffffff',
  },
]

export function faixaDoNivel(nivel: number): FaixaNivel {
  const clamped = Math.min(NIVEL_MAXIMO, Math.max(1, nivel))
  return (
    FAIXAS_NIVEL.find((f) => clamped >= f.nivelMin && clamped <= f.nivelMax) ?? FAIXAS_NIVEL[0]!
  )
}

export function rotuloFaixaNivel(nivel: number): string {
  const faixa = faixaDoNivel(nivel)
  return `Nível ${nivel} · ${faixa.nome}`
}

/** Percentual da jornada completa até o nível 50 (nv. 1 = 1%, nv. 50 = 100%) */
export function percentualJornadaNivel50(nivel: number): number {
  const clamped = Math.min(NIVEL_MAXIMO, Math.max(1, nivel))
  if (clamped >= NIVEL_MAXIMO) return 100
  if (clamped <= 1) return 1
  return Math.round((clamped / NIVEL_MAXIMO) * 100)
}

export interface ProgressoJornadaAdmin {
  percentualJornada: number
  progressoNaFaixaPct: number
  rotuloProximoMarco: string
  faixaAtual: FaixaNivel
}

/** Resumo para o painel admin — jornada 1–50 + marco da faixa atual */
export function progressoJornadaAdmin(nivel: number): ProgressoJornadaAdmin {
  const clamped = Math.min(NIVEL_MAXIMO, Math.max(1, nivel))
  const faixaAtual = faixaDoNivel(clamped)
  const spanFaixa = faixaAtual.nivelMax - faixaAtual.nivelMin + 1
  const posicaoNaFaixa = clamped - faixaAtual.nivelMin + 1

  const progressoNaFaixaPct =
    clamped >= NIVEL_MAXIMO ? 100 : Math.round((posicaoNaFaixa / spanFaixa) * 100)

  let rotuloProximoMarco: string
  if (clamped >= NIVEL_MAXIMO) {
    rotuloProximoMarco = 'Jornada completa — nível 50'
  } else if (clamped < faixaAtual.nivelMax) {
    const faixaSeguinte = faixaDoNivel(faixaAtual.nivelMax + 1)
    rotuloProximoMarco = `Próximo marco: Nv. ${faixaAtual.nivelMax} · ${faixaSeguinte.rotulo}`
  } else {
    const proximoNivel = clamped + 1
    const faixaSeguinte = faixaDoNivel(proximoNivel)
    rotuloProximoMarco = `Próximo: Nv. ${proximoNivel} · ${faixaSeguinte.rotulo}`
  }

  return {
    percentualJornada: percentualJornadaNivel50(clamped),
    progressoNaFaixaPct,
    rotuloProximoMarco,
    faixaAtual,
  }
}

/** Próximos marcos para a tela explicativa */
export function proximosMarcos(nivel: number, count = 4) {
  const marcos = []
  for (let n = Math.max(2, nivel); n <= Math.min(NIVEL_MAXIMO, nivel + count); n++) {
    marcos.push({
      nivel: n,
      xpTotal: xpParaAlcancarNivel(n),
      incremento: xpIncrementoProximoNivel(n - 1),
      gradiente: gradienteNivel(n),
    })
  }
  return marcos
}
