import { Link } from '@tanstack/react-router'
import type { TipoObra } from '@tcc-sistema/types'
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  FileText,
  Globe,
  ImagePlus,
  Loader2,
  PenLine,
  Plus,
  Quote,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ScrollReveal } from '@/features/app'
import {
  countPalavras,
  estimatePaginas,
  obraTemConteudo,
  useAdicionarCapitulo,
  useDespublicarObra,
  useMinhaObraEditor,
  usePublicarObra,
  useSalvarMinhaObra,
  useSalvarObraMeta,
  type ObraCapitulo,
} from '@/features/app/useMinhaObra'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  TIPO_OBRA_EDITOR_PLACEHOLDER,
  TIPO_OBRA_HINT,
  TIPO_OBRA_LABEL,
} from '@/lib/obraLabels'
import { DEFAULT_OBRA_COVER } from '@/lib/obraCover'
import { uploadObraCover, validateCoverFile } from '@/lib/storage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

const TIPOS: Array<{ id: TipoObra; icon: typeof BookOpen }> = [
  { id: 'livro', icon: BookOpen },
  { id: 'cronica', icon: FileText },
  { id: 'poema', icon: Quote },
]

export function MinhaObraEditorPage() {
  const { profile } = useAuth()
  const firstName = profile?.nome.split(' ')[0] ?? 'Leitor'
  const defaultTitle = `Obra de ${firstName}`

  const { data: obra, isLoading } = useMinhaObraEditor(profile?.id, defaultTitle)
  const salvar = useSalvarMinhaObra(profile?.id)
  const salvarMeta = useSalvarObraMeta(profile?.id)
  const adicionarCapitulo = useAdicionarCapitulo(profile?.id)
  const publicar = usePublicarObra(profile?.id)
  const despublicar = useDespublicarObra(profile?.id)

  const [tituloObra, setTituloObra] = useState('')
  const [descricao, setDescricao] = useState('')
  const [capaUrl, setCapaUrl] = useState<string | null>(null)
  const [tipoObra, setTipoObra] = useState<TipoObra>('livro')
  const [capituloAtivoId, setCapituloAtivoId] = useState<string | null>(null)
  const [tituloCapitulo, setTituloCapitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [dirty, setDirty] = useState(false)
  const [uploadingCapa, setUploadingCapa] = useState(false)

  const salvarRef = useRef(salvar)
  salvarRef.current = salvar
  const fileRef = useRef<HTMLInputElement>(null)

  const isLivro = tipoObra === 'livro'
  const isPublicada = obra?.publicado ?? false

  useEffect(() => {
    if (!obra || isLoading) return
    setTituloObra(obra.titulo)
    setDescricao(obra.descricao ?? '')
    setCapaUrl(obra.capa_url)
    setTipoObra(obra.tipo)
    if (!capituloAtivoId && obra.capitulos[0]) {
      const cap = obra.capitulos[0]
      setCapituloAtivoId(cap.id)
      setTituloCapitulo(cap.titulo)
      setTexto(cap.texto)
    }
  }, [obra?.id, isLoading, capituloAtivoId, obra])

  useEffect(() => {
    if (!dirty || !obra || !capituloAtivoId || isLoading) return

    const timer = window.setTimeout(() => {
      salvarRef.current.mutate(
        {
          obraId: obra.id,
          producaoId: capituloAtivoId,
          titulo: tituloObra.trim() || defaultTitle,
          descricao: descricao.trim() || null,
          capituloTitulo: isLivro ? tituloCapitulo.trim() || 'Capítulo' : 'Texto',
          texto,
        },
        {
          onSuccess: () => setDirty(false),
          onError: () => toast.error('Não foi possível salvar. Tente de novo.'),
        },
      )
    }, 900)

    return () => window.clearTimeout(timer)
  }, [
    dirty,
    tituloObra,
    descricao,
    tituloCapitulo,
    texto,
    obra,
    capituloAtivoId,
    defaultTitle,
    isLoading,
    isLivro,
  ])

  const trocarCapitulo = (cap: ObraCapitulo) => {
    if (cap.id === capituloAtivoId) return
    setCapituloAtivoId(cap.id)
    setTituloCapitulo(cap.titulo)
    setTexto(cap.texto)
    setDirty(false)
  }

  const handleTipoChange = async (next: TipoObra) => {
    if (!obra || next === tipoObra) return
    try {
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        tipo: next,
      })
      setTipoObra(next)
      toast.success(`Formato alterado para ${TIPO_OBRA_LABEL[next]}`)
    } catch {
      toast.error('Não foi possível alterar o formato')
    }
  }

  const handleNovaCapa = async (file: File) => {
    if (!obra || !profile) return
    const err = validateCoverFile(file)
    if (err) {
      toast.error(err)
      return
    }
    setUploadingCapa(true)
    try {
      const url = await uploadObraCover(file, profile.id, obra.id)
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        capa_url: url,
      })
      setCapaUrl(url)
      toast.success('Capa atualizada')
    } catch {
      toast.error('Não foi possível enviar a capa')
    } finally {
      setUploadingCapa(false)
    }
  }

  const handleNovoCapitulo = async () => {
    if (!obra) return
    try {
      const novo = await adicionarCapitulo.mutateAsync({ obraId: obra.id, tipo: tipoObra })
      setCapituloAtivoId(novo.id)
      setTituloCapitulo(novo.titulo)
      setTexto('')
      setDirty(false)
      toast.success('Novo capítulo criado')
    } catch {
      toast.error('Não foi possível criar o capítulo')
    }
  }

  const handlePublicar = async () => {
    if (!obra) return
    const temTexto = obraTemConteudo(
      obra.capitulos.map((c) =>
        c.id === capituloAtivoId ? { ...c, texto } : c,
      ),
    )
    if (!temTexto) {
      toast.error('Escreva algo antes de publicar')
      return
    }
    if (dirty || salvar.isPending) {
      toast.error('Aguarde o salvamento terminar')
      return
    }
    try {
      await publicar.mutateAsync(obra.id)
      toast.success('Obra publicada! Outros alunos já podem ler.')
    } catch {
      toast.error('Não foi possível publicar')
    }
  }

  const palavras = countPalavras(texto)
  const paginas = estimatePaginas(palavras)
  const totalPalavras =
    obra?.capitulos.reduce(
      (acc, c) => acc + countPalavras(c.id === capituloAtivoId ? texto : c.texto),
      0,
    ) ?? palavras

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <ScrollReveal>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar ao início
        </Link>
      </ScrollReveal>

      <ScrollReveal delayMs={40}>
        <div className="minha-obra-shell rounded-2xl border border-primary/10 bg-elevated shadow-[var(--shadow-card)]">
          <div className="minha-obra-shell-head flex flex-wrap items-start justify-between gap-4 border-b border-border/80 px-5 py-5 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <PenLine className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-navy sm:text-[1.65rem]">
                  Minha obra
                </h1>
                <p className="mt-1 text-sm text-text-muted">{TIPO_OBRA_HINT[tipoObra]}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isPublicada && (
                <Badge variant="success" className="gap-1 px-2.5 py-1">
                  <Globe className="h-3.5 w-3.5" aria-hidden />
                  Publicada
                </Badge>
              )}
              {isPublicada ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={despublicar.isPending}
                  onClick={() => void despublicar.mutateAsync(obra!.id)}
                >
                  Despublicar
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={publicar.isPending || dirty || salvar.isPending}
                  onClick={() => void handlePublicar()}
                >
                  <Globe className="h-4 w-4" aria-hidden />
                  Publicar obra
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <p className="flex items-center gap-2 px-7 py-12 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Preparando seu espaço de escrita…
            </p>
          ) : obra ? (
            <>
              <div className="border-b border-border/70 px-5 py-4 sm:px-7">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  O que você quer escrever?
                </p>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
                        tipoObra === id
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-border bg-elevated text-text-muted hover:border-primary/25 hover:text-text',
                      )}
                      onClick={() => void handleTipoChange(id)}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      {TIPO_OBRA_LABEL[id]}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cn('minha-obra-layout', !isLivro && 'is-single')}>
                <aside className="minha-obra-aside">
                  <button
                    type="button"
                    className="minha-obra-cover group"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingCapa}
                  >
                    {capaUrl ? (
                      <img src={capaUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <img
                          src={DEFAULT_OBRA_COVER}
                          alt=""
                          className="h-full w-full object-cover opacity-95"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/70 to-transparent p-3 pt-8">
                          <span className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white">
                            <ImagePlus className="h-4 w-4" aria-hidden />
                            Trocar capa
                          </span>
                        </div>
                      </>
                    )}
                    <span className="minha-obra-cover-overlay">
                      {uploadingCapa ? 'Enviando…' : 'Alterar capa'}
                    </span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleNovaCapa(file)
                      e.target.value = ''
                    }}
                  />

                  <div className="minha-obra-meta space-y-3 px-4 pb-4 pt-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="obra-titulo">Título</Label>
                      <Input
                        id="obra-titulo"
                        value={tituloObra}
                        onChange={(e) => {
                          setTituloObra(e.target.value)
                          setDirty(true)
                        }}
                        placeholder={defaultTitle}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="obra-descricao">Sinopse (opcional)</Label>
                      <Input
                        id="obra-descricao"
                        value={descricao}
                        onChange={(e) => {
                          setDescricao(e.target.value)
                          setDirty(true)
                        }}
                        placeholder="Do que fala?"
                      />
                    </div>
                    <p className="text-xs text-text-muted">
                      {isLivro
                        ? `${obra.capitulos.length} capítulo(s) · ~${estimatePaginas(totalPalavras)} págs.`
                        : `${palavras} palavras · ~${paginas} págs.`}
                    </p>
                  </div>

                  {isLivro && (
                    <nav className="minha-obra-capitulos" aria-label="Capítulos">
                      <p className="minha-obra-capitulos-label">Capítulos</p>
                      <ul role="list">
                        {obra.capitulos.map((cap) => (
                          <li key={cap.id}>
                            <button
                              type="button"
                              className={cn(
                                'minha-obra-capitulo-btn',
                                cap.id === capituloAtivoId && 'is-active',
                              )}
                              onClick={() => trocarCapitulo(cap)}
                            >
                              <BookMarked className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                              <span className="truncate">{cap.titulo}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full rounded-xl"
                        disabled={adicionarCapitulo.isPending}
                        onClick={() => void handleNovoCapitulo()}
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                        Novo capítulo
                      </Button>
                    </nav>
                  )}
                </aside>

                <div className="minha-obra-editor">
                  {isLivro && (
                    <div className="space-y-1.5 border-b border-border/70 px-5 py-4 sm:px-6">
                      <Label htmlFor="cap-titulo">Título do capítulo</Label>
                      <Input
                        id="cap-titulo"
                        value={tituloCapitulo}
                        onChange={(e) => {
                          setTituloCapitulo(e.target.value)
                          setDirty(true)
                        }}
                        placeholder="Capítulo 1"
                      />
                    </div>
                  )}

                  <div className="minha-obra-page px-5 py-5 sm:px-6 sm:py-6">
                    <Textarea
                      id="cap-texto"
                      value={texto}
                      onChange={(e) => {
                        setTexto(e.target.value)
                        setDirty(true)
                      }}
                      placeholder={TIPO_OBRA_EDITOR_PLACEHOLDER[tipoObra]}
                      className={cn(
                        'minha-obra-textarea min-h-[440px] w-full resize-y rounded-xl border border-border/80 bg-surface/50 px-4 py-4',
                        'text-[15px] leading-7 text-text shadow-none focus-visible:ring-2 focus-visible:ring-primary/25',
                        tipoObra === 'poema' && 'font-display leading-8',
                      )}
                    />
                  </div>

                  <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-5 py-3 sm:px-6">
                    <p className="text-xs text-text-muted">
                      {palavras} palavras
                      {paginas > 0 && ` · ~${paginas} ${paginas === 1 ? 'página' : 'páginas'}`}
                    </p>
                    <p
                      className={cn(
                        'text-xs font-medium',
                        salvar.isPending ? 'text-primary' : dirty ? 'text-text-muted' : 'text-success',
                      )}
                    >
                      {salvar.isPending ? 'Salvando…' : dirty ? 'Alterações pendentes…' : 'Tudo salvo'}
                    </p>
                  </footer>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </ScrollReveal>
    </div>
  )
}
