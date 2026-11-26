import type { IntegralDivisaoModo } from '@tcc-sistema/integral-import'
import { BookOpenCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

export type IntegralImportSuccessState = {
  fileName: string
  segmentos: number
  divisao: IntegralDivisaoModo
  totalPaginasPdf?: number
  origem: 'pdf' | 'txt' | 'link' | 'json'
}

function rotuloDivisao(divisao: IntegralDivisaoModo, segmentos: number): string {
  switch (divisao) {
    case 'paginas':
      return `${segmentos} página(s) do PDF`
    case 'capitulos':
      return `${segmentos} capítulo(s)`
    case 'partes':
      return `${segmentos} parte(s) da obra`
    default:
      return 'Texto em bloco único'
  }
}

function descricaoLeitura(divisao: IntegralDivisaoModo): string {
  if (divisao === 'paginas') {
    return 'Leitura contínua: cada trecho corresponde a uma página do PDF (quando o livro não tem capítulos detectados). O aluno avança com Anterior / Próxima.'
  }
  return 'Cada capítulo do Gutenberg ou do PDF vira uma página no leitor (Anterior / Próxima). Se o capítulo for longo, o aluno rola o texto dentro da mesma página.'
}

interface IntegralImportSuccessDialogProps {
  state: IntegralImportSuccessState | null
  onClose: () => void
}

export function IntegralImportSuccessDialog({ state, onClose }: IntegralImportSuccessDialogProps) {
  return (
    <Dialog
      open={Boolean(state)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title="Leitura integral pronta"
      description="Extração concluída e gravada neste livro."
    >
      {state && (
        <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="flex gap-3 rounded-xl border border-success/25 bg-[color-mix(in_srgb,var(--color-success)_12%,white)] p-4">
            <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-success" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-brand-navy">Importação finalizada</p>
              <p className="text-xs leading-relaxed text-text-muted">
                <span className="font-medium text-text">{state.fileName}</span> foi extraído, organizado e salvo neste
                cadastro.
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                <strong className="text-text">{rotuloDivisao(state.divisao, state.segmentos)}</strong>
                {state.divisao === 'paginas' && state.totalPaginasPdf
                  ? ` (de ${state.totalPaginasPdf} páginas do arquivo)`
                  : null}
              </span>
            </li>
            <li className="text-xs leading-relaxed">{descricaoLeitura(state.divisao)}</li>
          </ul>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" onClick={onClose}>
              Entendi
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}