import type { AlunoProgressStats } from '@/lib/alunoProgress'
import { faixaDoNivel } from '@/lib/alunoProgress'

export interface PaletaLivro {
  accent: string
  marcador: string
  ambiente: string
  barra: string
  texto: string
  textoMuted: string
}

export function paletaLivroCinematico(nivel: number, _progressoPct: number): PaletaLivro {
  const faixa = faixaDoNivel(nivel)
  return {
    accent: faixa.cor,
    marcador: '#ffffff',
    ambiente: faixa.cor,
    barra: '#ffffff',
    texto: '#ffffff',
    textoMuted: 'rgb(255 255 255 / 0.95)',
  }
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

export function mensagemAcolhedora(progress: AlunoProgressStats): string {
  if (progress.obrasConcluidas === 0 && progress.obrasExploradas === 0) {
    return 'Quando você abrir a primeira obra, sua história começa aqui.'
  }
  if (progress.obrasConcluidas === 0) return 'Você já começou — isso também conta.'
  if (progress.progressoNivelPct >= 85 && !progress.nivelMaximo) {
    return 'Falta pouco para virar mais uma página.'
  }
  if (progress.obrasConcluidas === 1) return 'Uma obra inteira nas suas mãos. Isso importa.'
  return 'Cada leitura deixa marca na sua jornada.'
}
