import { capitulosIntegralImportSchema } from '@tcc-sistema/schemas'
import { BookMarked, FileUp, Globe2, Link2, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type ReactNode } from 'react'
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { toast } from 'sonner'
import type { ConteudoFormInput } from '@tcc-sistema/schemas'
import {
  replaceCapitulosIntegralInDb,
  useCapitulosIntegral,
  useImportLeituraIntegralFromLink,
  useImportLeituraIntegralFromTextFile,
} from '@/features/app/useLeituraIntegral'
import { extractTextFromIntegralPdf } from '@/lib/integralPdfText'
import { isMislabeledPdfAsText, MSG_MISLABELED_PDF } from '@/lib/integralMislabeledFile'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'

const LINK_GUTENBERG_PP = 'https://www.gutenberg.net.au/ebooks03/0300771h.html'
const LINK_CERVANTES_DOM_CASMURRO =
  'https://www.cervantesvirtual.com/obra-visor/dom-casmurro--0/html/ffcddb46-82b1-11df-acc7-002185ce6064_2.html'
const LINK_DOMINIO_PUBLICO = 'https://dominiopublico.mec.gov.br/pesquisa/pesquisa.php'

function linkAmostraPortugues(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/leitura-integral/pequeno-principe-piloto.json`
  }
  return '/leitura-integral/pequeno-principe-piloto.json'
}

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
  tone = 'default',
}: {
  icon: ReactNode
  title: string
  lead: string
  children: ReactNode
  tone?: 'default' | 'primary' | 'accent'
}) {
  const toneClass =
    tone === 'primary'
      ? 'border-primary/25 bg-primary-light/20'
      : tone === 'accent'
        ? 'border-accent/30 bg-accent-light/20'
        : 'border-border/80 bg-white'
  return (
    <article className={`rounded-xl border p-4 sm:p-5 shadow-sm ${toneClass}`}>
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
  const pdfTxtRef = useRef<HTMLInputElement>(null)
  const jsonRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<string | null>(null)
  const [traduzirParaPt, setTraduzirParaPt] = useState(false)
  const [translateProgress, setTranslateProgress] = useState<string | null>(null)
  const [pdfExtractProgress, setPdfExtractProgress] = useState<string | null>(null)
  const [ensuringConteudo, setEnsuringConteudo] = useState(false)
  const progressToastRef = useRef<string | number | undefined>(undefined)
  const { data: capitulos = [], isLoading } = useCapitulosIntegral(conteudoId, Boolean(conteudoId))
  const importFromLink = useImportLeituraIntegralFromLink(conteudoId)
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

  const importBusy = ensuringConteudo || importFromText.isPending || importFromLink.isPending

  const statusCapitulos = !conteudoId ? (
    <span className="text-amber-900">
      Livro novo: ao clicar em importar ou enviar PDF, salvamos o cadastro automaticamente (precisa do título).
    </span>
  ) : isLoading ? (
    'Carregando capítulos…'
  ) : capitulos.length > 0 ? (
    `${capitulos.length} capítulo(s) já gravados para este livro`
  ) : (
    'Nenhum capítulo importado ainda'
  )

  const handleImportLink = async () => {
    const cid = await resolveConteudoId()
    if (!cid) return
    const url = fonteUrl?.trim()
    if (!url) {
      toast.error('Cole o link da obra no bloco “Importar por link”.')
      return
    }
    try {
      if (traduzirParaPt) {
        toast.message('Importando obra… em seguida a tradução roda neste navegador (não feche a aba).', {
          duration: 12_000,
        })
      }
      setTranslateProgress(null)
      const result = await importFromLink.mutateAsync({
        conteudoId: cid,
        fonteUrl: url,
        traduzirParaPt,
        onTranslateProgress: (current, total) => {
          const msg = `Traduzindo capítulo ${current} de ${total}…`
          setTranslateProgress(msg)
          if (progressToastRef.current !== undefined) {
            toast.loading(msg, { id: progressToastRef.current })
          } else {
            progressToastRef.current = toast.loading(msg)
          }
        },
      })
      if (progressToastRef.current !== undefined) toast.dismiss(progressToastRef.current)
      progressToastRef.current = undefined
      setTranslateProgress(null)
      toast.success(`${result.capitulos} capítulo(s) importados do link.`)
      if (result.aviso) toast.message(result.aviso, { duration: 8000 })
    } catch (e) {
      if (progressToastRef.current !== undefined) toast.dismiss(progressToastRef.current)
      progressToastRef.current = undefined
      setTranslateProgress(null)
      toast.error(e instanceof Error ? e.message : 'Falha ao importar do link')
    }
  }

  const handleImportFile = async (file: File, kind: 'pdf-txt' | 'json') => {
    const cid = await resolveConteudoId()
    if (!cid) return
    const nameLower = file.name.toLowerCase()
    const isJson = kind === 'json' || nameLower.endsWith('.json') || file.type === 'application/json'
    const isPdf = nameLower.endsWith('.pdf') || file.type === 'application/pdf'
    const isText =
      nameLower.endsWith('.txt') || file.type === 'text/plain' || file.type.startsWith('text/')
    try {
      let raw: string
      if (isPdf) {
        setPdfExtractProgress('Lendo PDF…')
        toast.message('Extraindo texto do PDF no navegador — pode levar um minuto.', { duration: 8000 })
        raw = await extractTextFromIntegralPdf(file, (page, total) => {
          setPdfExtractProgress(`Página ${page} de ${total}…`)
        })
        setPdfExtractProgress(null)
      } else {
        raw = await file.text()
        if (!isJson && isMislabeledPdfAsText(raw)) {
          toast.error(MSG_MISLABELED_PDF)
          return
        }
      }
      if (isJson) {
        const json: unknown = JSON.parse(raw)
        const parsed = capitulosIntegralImportSchema.parse(json)
        if (parsed.meta?.fonte_url) {
          setValue('integral_fonte_url', parsed.meta.fonte_url)
        }
        await replaceCapitulosIntegralInDb(cid, parsed)
        await queryClient.invalidateQueries({ queryKey: ['capitulos-integral', cid] })
        setPendingFile(file.name)
        toast.success(`${parsed.capitulos.length} capítulo(s) importados.`)
        return
      }
      if (isText || isPdf) {
        const result = await importFromText.mutateAsync({
          conteudoId: cid,
          texto: raw,
          fonteUrl: fonteUrl?.trim() || null,
          traduzirParaPt: isPdf ? false : traduzirParaPt,
          onTranslateProgress: (current, total) => {
            setTranslateProgress(`Traduzindo capítulo ${current} de ${total}…`)
          },
        })
        setPendingFile(file.name)
        toast.success(`${result.capitulos} capítulo(s) importados do arquivo.`)
        if (result.aviso) toast.message(result.aviso, { duration: 9000 })
        return
      }
      toast.error('Use PDF ou .txt do Domínio Público neste bloco.')
    } catch (e) {
      setPdfExtractProgress(null)
      toast.error(e instanceof Error ? e.message : 'Não foi possível importar o arquivo')
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-primary/20 bg-primary-light/15 p-4 sm:p-5">
      <div>
        <p className="text-sm font-semibold text-brand-navy">Leitura integral (opcional)</p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          Depois que o aluno concluir o estudo do resumo, ele pode ler o livro inteiro aqui no EntreLinhas. Escolha o
          caminho que combina com a obra — cada bloco abaixo é independente.
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
            {(translateProgress || pdfExtractProgress) && (
              <p className="mt-1 font-medium text-primary">{translateProgress ?? pdfExtractProgress}</p>
            )}
            {pendingFile && (
              <p className="mt-1 text-[11px]">Último arquivo enviado: {pendingFile}</p>
            )}
          </div>

          <IntegralCanalCard
            tone="primary"
            icon={<BookMarked className="h-5 w-5" aria-hidden />}
            title="Obra brasileira — Domínio Público (MEC)"
            lead="Baixe o PDF na ficha da obra e envie aqui. O texto é extraído no seu navegador — use o arquivo .pdf, não renomeie para .txt."
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
              , abra a obra e use o botão de download em PDF.
            </p>
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
                Só para registro: de onde veio o PDF. O aluno não abre esse link para ler.
              </p>
            </div>
            <input
              ref={pdfTxtRef}
              type="file"
              accept=".pdf,application/pdf,.txt,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleImportFile(file, 'pdf-txt')
                e.target.value = ''
              }}
            />
            <Button
              type="button"
              disabled={disabled || importBusy}
              onClick={() => pdfTxtRef.current?.click()}
            >
              {importBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <FileUp className="h-4 w-4" aria-hidden />
              )}
              Enviar PDF ou .txt do Domínio Público
            </Button>
          </IntegralCanalCard>

          <IntegralCanalCard
            tone="accent"
            icon={<Globe2 className="h-5 w-5" aria-hidden />}
            title="Importar por link na internet"
            lead="HTML da Cervantes, Gutenberg Australia ou link direto para um .txt. Cole a URL da página da obra (não a home do site)."
          >
            <div className="space-y-2">
              <Label htmlFor="integral_fonte_url_link">Link da página da obra</Label>
              <Input
                id="integral_fonte_url_link"
                placeholder="https://www.gutenberg.net.au/ebooks03/0300771h.html"
                disabled={disabled}
                {...register('integral_fonte_url')}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  disabled={disabled}
                  onClick={() => setValue('integral_fonte_url', LINK_CERVANTES_DOM_CASMURRO)}
                >
                  Ex.: Dom Casmurro (Cervantes)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  disabled={disabled}
                  onClick={() => setValue('integral_fonte_url', LINK_GUTENBERG_PP)}
                >
                  Ex.: Pequeno Príncipe (Gutenberg AU)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  disabled={disabled}
                  onClick={() => setValue('integral_fonte_url', linkAmostraPortugues())}
                >
                  Ex.: teste em português (EntreLinhas)
                </Button>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-primary/30"
                checked={traduzirParaPt}
                disabled={disabled}
                onChange={(e) => setTraduzirParaPt(e.target.checked)}
              />
              <span className="text-xs leading-relaxed text-text-muted">
                <strong className="text-text">Traduzir para português</strong> (obras em outro idioma, ex. francês no
                Gutenberg). Roda no seu navegador — não feche a aba.
              </span>
            </label>

            <Button
              type="button"
              variant="secondary"
              disabled={disabled || importBusy}
              onClick={() => void handleImportLink()}
            >
              {importFromLink.isPending || ensuringConteudo ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Link2 className="h-4 w-4" aria-hidden />
              )}
              Importar capítulos deste link
            </Button>

            <p className="text-[11px] leading-relaxed text-text-muted">
              <strong>Pequeno Príncipe:</strong> o HTML do Gutenberg AU está em francês — marque tradução ou use texto
              em português de fonte legal por PDF/.txt no bloco acima.
            </p>
          </IntegralCanalCard>

          <details className="rounded-xl border border-dashed border-border/80 bg-surface/30 px-4 py-3 text-sm">
            <summary className="cursor-pointer text-xs font-medium text-text-muted">
              Registro da tradução e backup técnico (JSON)
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="integral_traducao_metodo">Método do texto em PT</Label>
                  <select
                    id="integral_traducao_metodo"
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                    disabled={disabled}
                    {...register('integral_traducao_metodo')}
                  >
                    <option value="">Selecione…</option>
                    <option value="preimportado">Importado por link / JSON</option>
                    <option value="pt_nativo">Original já em português</option>
                    <option value="nao_aplicavel">Não aplicável</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="integral_traducao_credito">Crédito da tradução</Label>
                  <Input
                    id="integral_traducao_credito"
                    placeholder="EntreLinhas"
                    disabled={disabled}
                    {...register('integral_traducao_credito')}
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <p className="text-[11px] text-text-muted">
                  JSON só para restaurar cópia já exportada ou testes internos — não é o fluxo normal para professores.
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
            </div>
          </details>
        </div>
      )}
    </section>
  )
}