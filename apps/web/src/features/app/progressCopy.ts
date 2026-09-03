import type { AlunoProgressStats } from '@/features/app/alunoProgress'
import { calcularProgressoAluno, faixaDoNivel } from '@/features/app/alunoProgress'
import { supabase } from '@/lib/supabase'

export interface PaletaLivro {
  accent: string
  marcador: string
  pagina: string
  paginaEscura: string
  glow: string
  barra: string
  barraTrack: string
  /** Fundo sólido do card — mesma ideia do avatar (cor pintada) */
  ambiente: string
  faixaNome: string
  texto: string
  textoMuted: string
}

/** Paleta sólida por faixa — card pintado como o avatar do aluno */
export function paletaLivroCinematico(nivel: number, _progressoPct: number): PaletaLivro {
  const faixa = faixaDoNivel(nivel)

  return {
    accent: faixa.cor,
    marcador: '#ffffff',
    pagina: 'rgb(255 255 255 / 0.38)',
    paginaEscura: 'rgb(255 255 255 / 0.52)',
    glow: faixa.cor,
    barra: '#ffffff',
    barraTrack: 'rgb(255 255 255 / 0.28)',
    ambiente: faixa.cor,
    faixaNome: faixa.nome,
    texto: '#ffffff',
    textoMuted: 'rgb(255 255 255 / 0.82)',
  }
}

export function corMarcador(nivel: number): string {
  return faixaDoNivel(nivel).cor
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
