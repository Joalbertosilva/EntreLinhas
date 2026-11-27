import { capitulosIntegralImportSchema } from '@tcc-sistema/schemas'
import { BookMarked, FileUp, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type ReactNode } from 'react'
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { toast } from 'sonner'
import type { ConteudoFormInput } from '@tcc-sistema/schemas'
import {
  replaceCapitulosIntegralInDb,
  useCapitulosIntegral,
  useImportLeituraIntegralFromTextFile,
  invalidateCapitulosIntegralCache,
} from '@/features/app/useLeituraIntegral'
import { inferIntegralDivisaoModo } from '@tcc-sistema/integral-import'
import { extractTextFromIntegralPdf, INTEGRAL_PDF_MAX_BYTES } from '@/lib/integralPdfText'
import { INTEGRAL_TEXTO_MAX_CHARS } from '@/lib/integralImportClient'
import {
  IntegralImportSuccessDialog,
  type IntegralImportSuccessState,
} from '@/features/conteudos/IntegralImportSuccessDialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'

const LINK_DOMINIO_PUBLICO = 'https://dominiopublico.mec.gov.br/pesquisa/pesquisa.php'
const INTEGRAL_PDF_MAX_MB = INTEGRAL_PDF_MAX_BYTES / (1024 * 1024)
const INTEGRAL_TEXTO_MAX_LABEL = (INTEGRAL_TEXTO_MAX_CHARS / 1_000_000).toLocaleString('pt-BR', {
  maximumFractionDigits: 1,
})

interface LeituraIntegralFormSectionProps {
  conteudoId: string | undefined
  ensureConteudoId?: () => Promise<string | undefined>
  register: UseFormRegister<ConteudoFormInput>
  setValue: UseFormSetValue<ConteudoFormInput>
  watch: UseFormWatch<ConteudoFormInput>
  disabled?: boolean
}

function IntegralCanalCard({
  icon,
  title,
  lead,
  children,
}: {
  icon: ReactNode
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <article className="rounded-xl border border-primary/25 bg-primary-light/20 p-4 sm:p-5 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-primary shadow-sm ring-1 ring-border/60">
          {icon}
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
          <p className="text-xs leading-relaxed text-text-muted">{lead}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 border-t border-border/50 pt-4">{children}</div>
    </article>
  )
}

export function LeituraIntegralFormSection({
  conteudoId,
  ensureConteudoId,
  register,
  setValue,
  watch,
  disabled,
}: LeituraIntegralFormSectionProps) {
  const queryClient = useQueryClient()
  const integralAtiva = watch('integral_ativa')
  const fonteUrl = watch('integral_fonte_url')
  const pdfRef = useRef<HTMLInputElement>(null)
  const jsonRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<string | null>(null)
  const [pdfExtractProgress, setPdfExtractProgress] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<IntegralImportSuccessState | null>(null)
  const [ensuringConteudo, setEnsuringConteudo] = useState(false)
  const { data: capitulos = [], isLoading } = useCapitulosIntegral(conteudoId, Boolean(conteudoId))
  const importFromText = useImportLeituraIntegralFromTextFile(conteudoId)

  const resolveConteudoId = async (): Promise<string | null> => {
    if (conteudoId) return conteudoId
    if (!ensureConteudoId) return null
    setEnsuringConteudo(true)
    try {
      const id = await ensureConteudoId()
      return id ?? null
    } finally {
      setEnsuringConteudo(false)
    }
  }

  const importBusy = ensuringConteudo || importFromText.isPending

  const divisaoAtual =
    capitulos.length > 0
      ? inferIntegralDivisaoModo(capitulos.map((c) => ({ titulo: c.titulo })))
      : null

  const statusCapitulos = !conteudoId ? (
    <span className="text-amber-900">
      Livro novo: ao enviar o PDF, salvamos o cadastro automaticamente (precisa do título).
    </span>
  ) : isLoading ? (
    'Carregando capítulos…'
  ) : capitulos.length > 0 ? (
    <span className="text-brand-navy">
      <span className="font-semibold text-success">Leitura integral publicada</span>
      {' — '}
      {divisaoAtual === 'paginas'
        ? `${capitulos.length} página(s) do PDF (mesma ordem do livro)`
        : `${capitulos.length} trecho(s) gravados`}
    </span>
  ) : (
    'Nenhum texto integral importado ainda'
  )

  const handleImportFile = async (file: File, kind: 'pdf' | 'json') => {
    const cid = await resolveConteudoId()
    if (!cid) return
    const nameLower = file.name.toLowerCase()
    const isJson = kind === 'json' || nameLower.endsWith('.json') || file.type === 'application/json'
    const isPdf = nameLower.endsWith('.pdf') || file.type === 'application/pdf'

    try {
      if (isJson) {
        const raw = await file.text()
        const json: unknown = JSON.parse(raw)
        const parsed = capitulosIntegralImportSchema.parse(json)
        if (parsed.meta?.fonte_url) {
          setValue('integral_fonte_url', parsed.meta.fonte_url)
        }
        await replaceCapitulosIntegralInDb(cid, parsed)
        invalidateCapitulosIntegralCache(queryClient, cid)
        setPendingFile(file.name)
        setImportSuccess({
          fileName: file.name,
          segmentos: parsed.capitulos.length,
          divisao: inferIntegralDivisaoModo(parsed.capitulos),
          origem: 'json',
        })
        toast.success('JSON importado e salvo no site.')
        return
      }

      if (!isPdf) {
        toast.error('Use somente PDF do Domínio Público (MEC).')
        return
      }

      setPdfExtractProgress('Lendo PDF…')
      toast.message('Extraindo o PDF no navegador — uma folha do arquivo vira uma página na leitura.', {
        duration: 10_000,
      })
      const raw = await extractTextFromIntegralPdf(file, (page, total) => {
        setPdfExtractProgress(`Página ${page} de ${total}…`)
      })
      setPdfExtractProgress(null)

      const result = await importFromText.mutateAsync({
        conteudoId: cid,
        texto: raw,
        fonteUrl: fonteUrl?.trim() || null,
      })
      setPendingFile(file.name)
      setImportSuccess({
        fileName: file.name,
        segmentos: result.capitulos,
        divisao: result.divisao ?? 'paginas',
        totalPaginasPdf: result.totalPaginasPdf,
        origem: 'pdf',
      })
      setValue('integral_traducao_metodo', 'pt_nativo')
      setValue('integral_traducao_credito', 'Texto original em português (Domínio Público)')
      toast.success('PDF organizado e salvo — leitura integral pronta para revisão.')
      if (result.aviso) toast.message(result.aviso, { duration: 9000 })
    } catch (e) {
      setPdfExtractProgress(null)
      toast.error(e instanceof Error ? e.message : 'Não foi possível importar o PDF')
    }
  }

  return (
    <>
      <IntegralImportSuccessDialog state={importSuccess} onClose={() => setImportSuccess(null)} />
      <section className="space-y-4 rounded-xl border border-primary/20 bg-primary-light/15 p-4 sm:p-5">
        <div>
          <p className="text-sm font-semibold text-brand-navy">Leitura integral (opcional)</p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            Depois que o aluno concluir o estudo do resumo, ele pode ler o livro inteiro aqui. A fonte é o PDF
            do Domínio Público — cada página do arquivo vira uma página na leitura, com capítulos identificados
            quando o livro os tiver.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-primary/30"
            disabled={disabled}
            {...register('integral_ativa')}
          />
          Oferecer leitura integral após o aluno concluir o estudo
        </label>

        {integralAtiva && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="integral_licenca">Licença da integral</Label>
              <select
                id="integral_licenca"
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                disabled={disabled}
                {...register('integral_licenca')}
              >
                <option value="">Selecione…</option>
                <option value="dominio_publico">Domínio público</option>
                <option value="sem_leitura_integral">Sem leitura integral</option>
              </select>
            </div>

            <div
              className="rounded-xl border border-border/60 bg-surface/50 px-3 py-2.5 text-xs text-text-muted"
              role="status"
            >
              {statusCapitulos}
              {pdfExtractProgress && (
                <p className="mt-1 font-medium text-primary">{pdfExtractProgress}</p>
              )}
              {pendingFile && (
                <p className="mt-1 text-[11px]">Último arquivo enviado: {pendingFile}</p>
              )}
            </div>

            <IntegralCanalCard
              icon={<BookMarked className="h-5 w-5" aria-hidden />}
              title="PDF — Domínio Público (MEC)"
              lead="Baixe o PDF na ficha da obra e envie aqui. O texto sai igual ao do livro: sem cortar prefácio nem sumário, com capítulos reconhecidos no título quando aparecem na página."
            >
              <p className="text-[11px] leading-relaxed text-text-muted">
                Pesquise em{' '}
                <a
                  href={LINK_DOMINIO_PUBLICO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  dominiopublico.mec.gov.br
                </a>
                , abra a obra e use o botão de download em PDF. O arquivo precisa ter texto selecionável (não só
                imagem escaneada).
              </p>
              <div
                className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-[11px] leading-relaxed text-amber-950"
                role="note"
              >
                <p className="font-semibold text-amber-900">Tamanho do arquivo e do que fica na plataforma</p>
                <ul className="mt-1.5 list-inside list-disc space-y-1 text-amber-950/95">
                  <li>
                    O PDF enviado pode ter até <strong>{INTEGRAL_PDF_MAX_MB} MB</strong>. A extração roda no
                    navegador; o PDF <strong>não</strong> é armazenado no servidor.
                  </li>
                  <li>
                    No banco fica só o <strong>texto</strong> (capítulos/páginas). Ex.: um PDF de ~6 MB costuma
                    virar cerca de <strong>100–150 KB</strong> de texto — muito menor que o arquivo original.
                  </li>
                  <li>
                    Limite do texto extraído: até <strong>{INTEGRAL_TEXTO_MAX_LABEL} milhão</strong> de caracteres por
                    obra (livros do Domínio Público ficam bem abaixo disso).
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label htmlFor="integral_fonte_url_mec">Link da ficha no MEC (opcional)</Label>
                <Input
                  id="integral_fonte_url_mec"
                  placeholder="https://dominiopublico.mec.gov.br/…"
                  disabled={disabled}
                  value={fonteUrl ?? ''}
                  onChange={(e) =>
                    setValue('integral_fonte_url', e.target.value, { shouldDirty: true, shouldValidate: true })
                  }
                />
                <p className="text-[11px] text-text-muted">
                  Só para registro: de onde veio o PDF. O aluno lê o texto gravado aqui, não abre esse link.
                </p>
              </div>
              <input
                ref={pdfRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleImportFile(file, 'pdf')
                  e.target.value = ''
                }}
              />
              <Button
                type="button"
                disabled={disabled || importBusy}
                onClick={() => pdfRef.current?.click()}
              >
                {importBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <FileUp className="h-4 w-4" aria-hidden />
                )}
                Enviar PDF da obra
              </Button>
            </IntegralCanalCard>

            <details className="rounded-xl border border-dashed border-border/80 bg-surface/30 px-4 py-3 text-sm">
              <summary className="cursor-pointer text-xs font-medium text-text-muted">
                Backup técnico (JSON) — só restauração
              </summary>
              <div className="mt-4 space-y-2">
                <p className="text-[11px] text-text-muted">
                  Para equipe técnica recuperar uma exportação já feita. O fluxo normal do professor é só o PDF.
                </p>
                <input
                  ref={jsonRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleImportFile(file, 'json')
                    e.target.value = ''
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || importBusy}
                  onClick={() => jsonRef.current?.click()}
                >
                  <FileUp className="h-4 w-4" aria-hidden />
                  Enviar arquivo .json
                </Button>
              </div>
            </details>
          </div>
        )}
      </section>
    </>
  )
}