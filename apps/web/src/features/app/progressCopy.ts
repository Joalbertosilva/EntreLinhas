import type { AlunoProgressStats } from '@/features/app/alunoProgress'
import { calcularProgressoAluno } from '@/features/app/alunoProgress'
import { supabase } from '@/lib/supabase'

/** Azul escuro do card / livro / chips */
export const JORNADA_AZUL = '#00008A'

/** Cor separada só para a barra de progresso — âmbar natural */
export const JORNADA_PROGRESSO = '#b8860b'
export const JORNADA_PROGRESSO_TRACK = '#f2ebe0'

export interface PaletaLivro {
  /** Azul #00008A — chips, livro, botão */
  accent: string
  marcador: string
  pagina: string
  paginaEscura: string
  glow: string
  /** Barra de progresso — cor distinta do azul */
  barra: string
  barraTrack: string
  /** Fundo do card — branco levemente azulado, sem lilás */
  ambiente: string
}

const AZUL = { r: 0, g: 0, b: 138 } as const

function rgba(c: { r: number; g: number; b: number }, a: number) {
  return `rgb(${c.r} ${c.g} ${c.b} / ${a})`
}

/** Card azul #00008A + barra âmbar — tudo sólido, sem gradiente */
export function paletaLivroCinematico(_nivel: number, _progressoPct: number): PaletaLivro {
  return {
    accent: JORNADA_AZUL,
    marcador: JORNADA_AZUL,
    pagina: rgba(AZUL, 0.28),
    paginaEscura: rgba(AZUL, 0.4),
    glow: 'transparent',
    barra: JORNADA_PROGRESSO,
    barraTrack: JORNADA_PROGRESSO_TRACK,
    ambiente: '#eef0f8',
  }
}

export function corMarcador(_nivel: number): string {
  return JORNADA_AZUL
}

export function fraseCapitulo(nivel: number): string {
  if (nivel <= 1) return 'Capítulo um'
  return `Capítulo ${nivel}`
}

export function mensagemAcolhedora(progress: AlunoProgressStats): string {
  if (progress.obrasConcluidas === 0 && progress.obrasExploradas === 0) {
    return 'Quando você abrir a primeira obra, sua história começa aqui.'
  }
  if (progress.obrasConcluidas === 0) {
    return 'Você já começou — isso também conta.'
  }
  if (progress.progressoNivelPct === 0 && progress.nivel > 1) {
    return 'Capítulo novo — a primeira folha está em branco. Continue lendo.'
  }
  if (progress.progressoNivelPct >= 85 && !progress.nivelMaximo) {
    return 'Falta pouco para virar mais uma página.'
  }
  if (progress.obrasConcluidas === 1) {
    return 'Uma obra inteira nas suas mãos. Isso importa.'
  }
  return 'Cada leitura deixa marca na sua jornada.'
}

export function resumoLeituras(progress: AlunoProgressStats): string {
  const partes: string[] = []
  if (progress.obrasExploradas > 0) {
    partes.push(
      `${progress.obrasExploradas} ${progress.obrasExploradas === 1 ? 'obra aberta' : 'obras abertas'}`,
    )
  }
  if (progress.obrasConcluidas > 0) {
    partes.push(
      `${progress.obrasConcluidas} ${progress.obrasConcluidas === 1 ? 'terminada' : 'terminadas'}`,
    )
  }
  return partes.join(' · ') || 'Nenhuma leitura registrada ainda'
}

export async function fetchAlunoProgress(userId: string) {
  const { data, error } = await supabase
    .from('leituras')
    .select('status_leitura')
    .eq('usuario_id', userId)

  if (error) throw error
  return calcularProgressoAluno(data ?? [])
}
