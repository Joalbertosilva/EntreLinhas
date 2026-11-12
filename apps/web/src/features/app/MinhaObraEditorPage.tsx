import { Link } from '@tanstack/react-router'
import type { CategoriaObra, TipoObra } from '@tcc-sistema/types'
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  FileText,
  Globe,
  Loader2,
  PenLine,
  Plus,
  Quote,
  Trash2,
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
  useExcluirObra,
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
import {
  CATEGORIA_COVER_PALETTE,
  CATEGORIA_OBRA_LABEL,
  CATEGORIAS_LIVRO,
  CATEGORIAS_TEXTO,
} from '@/lib/obraCategoriaLabels'
import { ObraCoverArtPreview } from '@/components/obras/ObraCoverArtPreview'
import { generateObraCoverFile } from '@/lib/obraCoverArt'
import { resolveObraCapaFotoUrl } from '@/lib/obraCapaFoto'
import {
  extractObraCoverPhotoFile,
  obraCoverPhotoFileFromUrl,
} from '@/lib/obraCoverPhoto'
import { uploadObraCapaFoto, uploadObraCover, validateCoverFile } from '@/lib/storage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
  const excluirObra = useExcluirObra(profile?.id)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [tituloObra, setTituloObra] = useState('')
  const [descricao, setDescricao] = useState('')
  const [capaUrl, setCapaUrl] = useState<string | null>(null)
  const [tipoObra, setTipoObra] = useState<TipoObra>('livro')
  const [categoriaObra, setCategoriaObra] = useState<CategoriaObra>('ficcao')
  const [capituloAtivoId, setCapituloAtivoId] = useState<string | null>(null)
  const [tituloCapitulo, setTituloCapitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [dirty, setDirty] = useState(false)
  const [uploadingCapa, setUploadingCapa] = useState(false)
  const [capaPreview, setCapaPreview] = useState<string | null>(null)
  const [capaFotoSrc, setCapaFotoSrc] = useState<string | null>(null)

  const salvarRef = useRef(salvar)
  salvarRef.current = salvar
  const fileRef = useRef<HTMLInputElement>(null)
  const capaFotoFileRef = useRef<File | null>(null)
  const obraIdRef = useRef<string | null>(null)

  const isLivro = tipoObra === 'livro'
  const isPublicada = obra?.publicado ?? false

  useEffect(() => {
    if (!obra || isLoading) return

    const obraMudou = obraIdRef.current !== obra.id
    obraIdRef.current = obra.id

    setTituloObra(obra.titulo)
    setDescricao(obra.descricao ?? '')
    setTipoObra(obra.tipo)
    setCategoriaObra(obra.categoria ?? 'outro')

    if (obraMudou) {
      setCapaUrl(obra.capa_url)
      setCapaPreview(null)
      capaFotoFileRef.current = null
      setCapaFotoSrc(null)
      if (profile?.id) {
        void resolveObraCapaFotoUrl(profile.id, obra.id).then((url) => {
          if (url) setCapaFotoSrc(url)
        })
      }
    }

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

  const publicarCapaConceitual = async (photoFile: File, categoria: CategoriaObra) => {
    if (!obra || !profile) return
    setUploadingCapa(true)
    try {
      const fotoUrl = await uploadObraCapaFoto(photoFile, profile.id, obra.id)
      const coverFile = await generateObraCoverFile({
        photoFile,
        categoria,
        titulo: tituloObra.trim() || defaultTitle,
        autorNome: profile.nome,
      })
      const url = await uploadObraCover(coverFile, profile.id, obra.id)
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        capa_url: url.split('?')[0] ?? url,
        capa_foto_url: fotoUrl.split('?')[0] ?? fotoUrl,
      })
      setCapaUrl(url)
      setCapaFotoSrc(fotoUrl)
      capaFotoFileRef.current = photoFile
    } finally {
      setUploadingCapa(false)
    }
  }

  const resolverFotoParaCapa = async (): Promise<File | null> => {
    if (capaFotoFileRef.current) return capaFotoFileRef.current
    if (capaFotoSrc) {
      try {
        return await obraCoverPhotoFileFromUrl(capaFotoSrc)
      } catch {
        /* tenta legado */
      }
    }
    if (capaUrl) {
      try {
        return await extractObraCoverPhotoFile(capaUrl)
      } catch {
        return null
      }
    }
    return null
  }

  const handleCategoriaChange = async (next: CategoriaObra) => {
    if (!obra || !profile || next === categoriaObra || uploadingCapa) return
    try {
      await salvarMeta.mutateAsync({
        obraId: obra.id,
        titulo: tituloObra.trim() || defaultTitle,
        descricao: descricao.trim() || null,
        categoria: next,
      })
      setCategoriaObra(next)

      const photoFile = await resolverFotoParaCapa()
      if (!photoFile) return

      await publicarCapaConceitual(photoFile, next)
      toast.success('Capa atualizada para o novo gênero')
    } catch {
      toast.error('Não foi possível alterar a categoria')
    }
  }

  const handleNovaCapa = async (file: File) => {
    if (!obra || !profile) {
      toast.error('Sessão ou obra indisponível. Recarregue a página.')
      return
    }
    const err = validateCoverFile(file)
    if (err) {
      toast.error(err)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setCapaPreview(previewUrl)
    capaFotoFileRef.current = file

    try {
      await publicarCapaConceitual(file, categoriaObra)
      setCapaPreview(null)
      URL.revokeObjectURL(previewUrl)
      toast.success('Capa conceitual criada!')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      toast.error(
        msg.includes('policy') || msg.includes('row-level')
          ? 'Sem permissão para enviar capa. Use uma conta de aluno.'
          : `Não foi possível gerar a capa: ${msg}`,
      )
      setCapaPreview(null)
      URL.revokeObjectURL(previewUrl)
    }
  }

  const categoriasDisponiveis = isLivro ? CATEGORIAS_LIVRO : CATEGORIAS_TEXTO

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
              <Button
                variant="outline"
                size="sm"
                className="border-error/30 text-error hover:bg-error/5"
                disabled={excluirObra.isPending}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Apagar obra
              </Button>
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

              <div className="border-b border-border/70 px-5 py-4 sm:px-7">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Categoria da obra
                </p>
                <p className="mb-3 text-xs text-text-muted">
                  Define o estilo da capa conceitual quando você enviar uma foto.
                </p>
                <div className="flex flex-wrap gap-2">
                  {categoriasDisponiveis.map((cat) => {
                    const palette = CATEGORIA_COVER_PALETTE[cat]
                    const active = categoriaObra === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary-light text-primary'
                            : 'border-border bg-elevated text-text-muted hover:border-primary/25 hover:text-text',
                        )}
                        onClick={() => void handleCategoriaChange(cat)}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border"
                          style={{ backgroundColor: palette.mid, borderColor: palette.frame }}
                          aria-hidden
                        />
                        {CATEGORIA_OBRA_LABEL[cat]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={cn('minha-obra-layout', !isLivro && 'is-single')}>
                <aside className="minha-obra-aside">
                  <button
                    type="button"
                    className={cn('minha-obra-cover group', uploadingCapa && 'is-uploading')}
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingCapa}
                    aria-busy={uploadingCapa}
                  >
                    <ObraCoverArtPreview
                      categoria={categoriaObra}
                      titulo={tituloObra.trim() || defaultTitle}
                      photoSrc={capaPreview ?? capaFotoSrc}
                      className="h-full w-full"
                    />
                    <span className="minha-obra-cover-overlay">
                      {uploadingCapa ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                          Gerando capa…
                        </>
                      ) : (
                        'Enviar foto · capa conceitual'
                      )}
                    </span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
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
                        'text-base leading-7 text-text shadow-none focus-visible:ring-2 focus-visible:ring-primary/25',
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

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Apagar obra?"
        description="Todos os capítulos e rascunhos serão removidos permanentemente. Você poderá começar uma nova obra depois."
        confirmLabel="Apagar permanentemente"
        loading={excluirObra.isPending}
        onConfirm={() => {
          if (!obra) return
          void excluirObra.mutateAsync(obra.id).then(() => {
            toast.success('Obra apagada. Um novo espaço será criado na próxima visita.')
            setConfirmDelete(false)
          }).catch(() => {
            toast.error('Não foi possível apagar a obra')
          })
        }}
      />
    </div>
  )
}
