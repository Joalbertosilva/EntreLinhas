import { capitulosIntegralImportSchema } from '@tcc-sistema/schemas'
import { FileUp, Link2, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { toast } from 'sonner'
import type { ConteudoFormInput } from '@tcc-sistema/schemas'
import {
  useCapitulosIntegral,
  useImportLeituraIntegralFromLink,
  useImportLeituraIntegralFromTextFile,
  useReplaceCapitulosIntegral,
} from '@/features/app/useLeituraIntegral'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'

const LINK_GUTENBERG_PP = 'https://www.gutenberg.net.au/ebooks03/0300771h.html'

function linkAmostraPortugues(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/leitura-integral/pequeno-principe-piloto.json`
  }
  return '/leitura-integral/pequeno-principe-piloto.json'
}

interface LeituraIntegralFormSectionProps {
  conteudoId: string | undefined
  register: UseFormRegister<ConteudoFormInput>
  setValue: UseFormSetValue<ConteudoFormInput>
  watch: UseFormWatch<ConteudoFormInput>
  disabled?: boolean
}

export function LeituraIntegralFormSection({
  conteudoId,
  register,
  setValue,
  watch,
  disabled,
}: LeituraIntegralFormSectionProps) {
  const integralAtiva = watch('integral_ativa')
  const fonteUrl = watch('integral_fonte_url')
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<string | null>(null)
  const [traduzirParaPt, setTraduzirParaPt] = useState(true)
  const [translateProgress, setTranslateProgress] = useState<string | null>(null)
  const progressToastRef = useRef<string | number | undefined>(undefined)
  const { data: capitulos = [], isLoading } = useCapitulosIntegral(conteudoId, Boolean(conteudoId))
  const replaceCapitulos = useReplaceCapitulosIntegral(conteudoId)
  const importFromLink = useImportLeituraIntegralFromLink(conteudoId)
  const importFromText = useImportLeituraIntegralFromTextFile(conteudoId)

  const handleImportLink = async () => {
    if (!conteudoId) {
      toast.error('Salve o livro antes de importar.')
      return
    }
    const url = fonteUrl?.trim()
    if (!url) {
      toast.error('Cole o link no campo abaixo.')
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

  const handleImportFile = async (file: File) => {
    if (!conteudoId) {
      toast.error('Salve o conteúdo primeiro para importar capítulos.')
      return
    }
    const nameLower = file.name.toLowerCase()
    const isJson = nameLower.endsWith('.json') || file.type === 'application/json'
    const isText =
      nameLower.endsWith('.txt') || file.type === 'text/plain' || file.type.startsWith('text/')
    try {
      const raw = await file.text()
      if (isJson) {
        const json: unknown = JSON.parse(raw)
        const parsed = capitulosIntegralImportSchema.parse(json)
        if (parsed.meta?.fonte_url) {
          setValue('integral_fonte_url', parsed.meta.fonte_url)
        }
        await replaceCapitulos.mutateAsync(parsed)
        setPendingFile(file.name)
        toast.success(`${parsed.capitulos.length} capítulo(s) importados.`)
        return
      }
      if (isText) {
        const result = await importFromText.mutateAsync({
          texto: raw,
          fonteUrl: fonteUrl?.trim() || null,
          traduzirParaPt,
          onTranslateProgress: (current, total) => {
            setTranslateProgress(`Traduzindo capítulo ${current} de ${total}…`)
          },
        })
        setPendingFile(file.name)
        toast.success(`${result.capitulos} capítulo(s) importados do arquivo.`)
        if (result.aviso) toast.message(result.aviso, { duration: 9000 })
        return
      }
      toast.error('Use arquivo .txt (texto do site) ou .json (backup técnico).')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível importar o arquivo')
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-primary/20 bg-primary-light/15 p-4 sm:p-5">
      <div>
        <p className="text-sm font-semibold text-brand-navy">Leitura integral (opcional)</p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          O professor faz <strong>sozinho</strong>: acha a obra em domínio público, importa o{' '}
          <strong>livro inteiro</strong> por link ou arquivo <strong>.txt</strong>. O aluno só lê no EntreLinhas.
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-text-muted">
          <li>
            <strong>Brasileira em português:</strong> no Domínio Público, baixe o <strong>texto (.txt)</strong> no
            navegador · cole a URL da ficha no campo · envie o .txt em{' '}
            <strong>Enviar arquivo de texto</strong>.
          </li>
          <li>
            <strong>Obra estrangeira:</strong> link HTML no <code className="rounded bg-surface px-1">gutenberg.net.au</code>{' '}
            · <strong>Importar do link</strong> com tradução automática para português (como o Tradutor do Google).
          </li>
          <li>
            Ou cole link que termina em <code className="rounded bg-surface px-1">.txt</code> (Project Gutenberg) e
            importe pelo link.
          </li>
        </ol>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
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

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="integral_fonte_url">Link da obra (cole aqui)</Label>
            <Input
              id="integral_fonte_url"
              placeholder="https://www.gutenberg.net.au/ebooks03/0300771h.html"
              disabled={disabled}
              {...register('integral_fonte_url')}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => {
                  setValue('integral_fonte_url', LINK_GUTENBERG_PP)
                }}
              >
                Ex.: Pequeno Príncipe (Gutenberg — referência)
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => {
                  setValue('integral_fonte_url', linkAmostraPortugues())
                }}
              >
                Ex.: Pequeno Príncipe (teste em português — EntreLinhas)
              </Button>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-primary/30"
              checked={traduzirParaPt}
              disabled={disabled}
              onChange={(e) => setTraduzirParaPt(e.target.checked)}
            />
            <span className="text-xs leading-relaxed text-text-muted">
              <strong className="text-text">Traduzir automaticamente para português</strong> ao importar (obra em
              outro idioma). A tradução roda no seu navegador — não feche a aba até terminar.
            </span>
          </label>
          {translateProgress && (
            <p className="text-xs font-medium text-primary sm:col-span-2" role="status">
              {translateProgress}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button
              type="button"
              disabled={disabled || !conteudoId || importFromLink.isPending}
              onClick={() => void handleImportLink()}
            >
              {importFromLink.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Link2 className="h-4 w-4" aria-hidden />
              )}
              Importar do link
            </Button>
            {conteudoId && (
              <span className="text-xs text-text-muted">
                {isLoading
                  ? 'Carregando capítulos…'
                  : capitulos.length > 0
                    ? `${capitulos.length} capítulo(s) no banco`
                    : 'Nenhum capítulo importado ainda'}
              </span>
            )}
            {!conteudoId && (
              <span className="text-xs text-amber-800">Salve o livro para importar.</span>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-text-muted sm:col-span-2">
            <strong>*O Pequeno Príncipe*:</strong> Gutenberg Australia (HTML) = obra inteira em francês. Para
            português, use fonte em PT (Domínio Público ou texto legal) em arquivo <code>.txt</code> — não há JSON
            público na internet para baixar.
          </p>

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

          <div className="sm:col-span-2 space-y-2">
            <Label>Arquivo da obra (livro inteiro)</Label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".txt,text/plain,application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleImportFile(file)
                  e.target.value = ''
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  disabled || !conteudoId || replaceCapitulos.isPending || importFromText.isPending
                }
                onClick={() => fileRef.current?.click()}
              >
                {replaceCapitulos.isPending || importFromText.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <FileUp className="h-4 w-4" aria-hidden />
                )}
                Enviar arquivo (.txt ou JSON)
              </Button>
              {pendingFile && <span className="text-xs text-text-muted">Último: {pendingFile}</span>}
            </div>
            <p className="text-[11px] text-text-muted">
              O usual é <strong>.txt</strong> baixado do Domínio Público ou do Gutenberg. JSON só se alguém exportou
              capítulos manualmente.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}