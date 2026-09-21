import { useEffect, useState } from 'react'
import { Loader2, Lock, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { InteracaoComAutor, Tema } from '@tcc-sistema/types'
import { getReflexaoDisplay } from '@/features/conteudos/conteudoReflexao'
import {
  useComentariosPublicos,
  useMinhasInteracoes,
  useSalvarInteracao,
} from '@/features/app/useConteudoEngagement'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import { cn } from '@/lib/utils'

interface ConteudoReflexoesSectionProps {
  conteudoId: string
  usuarioId: string | undefined
  temas: Tema[]
  variant?: 'default' | 'book'
}

export function ConteudoReflexoesSection({
  conteudoId,
  usuarioId,
  temas,
  variant = 'default',
}: ConteudoReflexoesSectionProps) {
  const temasComFrase = temas.filter((t) => t.questionamento?.trim())

  if (temasComFrase.length === 0) {
    return (
      <Card className="border-dashed border-primary/15 bg-elevated-muted">
        <CardContent className="p-5 sm:p-6">
          <p className="text-sm text-text-muted">
            Ainda não há frases ou perguntas de reflexão cadastradas para este conteúdo. A equipe
            pode adicioná-las em <strong className="text-text">Gerenciar → Temas reflexivos</strong>.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section id="secao-reflexao" className="scroll-mt-24 space-y-4">
      <div className={cn('flex items-start gap-3', variant === 'book' && 'book-interaction-header')}>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light text-brand-navy',
            variant === 'book' && 'book-interaction-icon',
          )}
        >
          <Lock className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h2 className={cn('text-lg font-semibold text-brand-navy', variant === 'book' && 'book-interaction-title')}>
            Sua reflexão
          </h2>
          <p className="text-sm text-text-muted">
            Só você e a equipe leem — escreva com calma, no seu ritmo.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {temasComFrase.map((tema) => (
          <ReflexaoCard
            key={tema.id}
            conteudoId={conteudoId}
            usuarioId={usuarioId}
            tema={tema}
            variant={variant}
          />
        ))}
      </div>
    </section>
  )
}

function ReflexaoCard({
  conteudoId,
  usuarioId,
  tema,
  variant = 'default',
}: {
  conteudoId: string
  usuarioId: string | undefined
  tema: Tema
  variant?: 'default' | 'book'
}) {
  const { data: minhas = [] } = useMinhasInteracoes(conteudoId, usuarioId)
  const salvar = useSalvarInteracao(conteudoId, usuarioId)
  const existente = minhas.find(
    (i) => i.tipo_interacao === 'reflexao_orientada' && i.tema_id === tema.id,
  )

  const [texto, setTexto] = useState('')

  useEffect(() => {
    setTexto(existente?.texto ?? '')
  }, [existente?.texto, existente?.id])

  const handleSave = async () => {
    if (!texto.trim()) {
      toast.error('Escreva sua reflexão antes de salvar')
      return
    }
    try {
      await salvar.mutateAsync({
        id: existente?.id,
        tipo_interacao: 'reflexao_orientada',
        tema_id: tema.id,
        texto,
      })
      toast.success(existente ? 'Reflexão atualizada' : 'Reflexão salva')
    } catch {
      toast.error('Não foi possível salvar sua reflexão')
    }
  }

  const { frase, reflexao, pergunta, rotulo } = getReflexaoDisplay(tema)

  return (
    <div className={cn(variant === 'book' ? 'book-interaction-panel' : 'surface-card overflow-hidden rounded-2xl')}>
      {variant === 'default' && (
        <div className="h-1 bg-gradient-to-r from-primary/80 via-accent to-primary/60" aria-hidden />
      )}
      <div className={cn('space-y-5', variant === 'book' ? 'p-0' : 'p-5 sm:p-6')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-navy">
            {rotulo}
          </span>
          <span className="text-[11px] font-medium text-text-muted">Reflexão privada</span>
        </div>

        <figure
          className={cn(
            'rounded-xl px-4 py-5 sm:px-5',
            variant === 'book'
              ? 'book-quote-block'
              : 'bg-gradient-to-br from-primary-light/80 to-white',
          )}
        >
          <blockquote className="text-base font-medium leading-relaxed text-brand-navy sm:text-lg">
            &ldquo;{frase}&rdquo;
          </blockquote>
        </figure>

        {reflexao && (
          <div className="rounded-xl border border-accent/25 bg-accent-light/25 px-4 py-4 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5c4800]">Reflexão</p>
            <p className="mt-2 text-base leading-relaxed text-text">{reflexao}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Pergunta</p>
          <p className="mt-2 text-base font-semibold leading-snug text-text">{pergunta}</p>
        </div>

        <div className="space-y-2 border-t border-border/50 pt-4">
          <label htmlFor={`reflexao-${tema.id}`} className="text-sm font-medium text-text">
            Sua resposta
          </label>
          <Textarea
            id={`reflexao-${tema.id}`}
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva aqui o que você pensa e sente..."
            className="min-h-[100px] resize-y bg-elevated"
          />
          <p className="text-xs text-text-muted">
            Não existe resposta certa ou errada — o importante é o que a leitura significa para você.
          </p>
        </div>

        <Button size="sm" onClick={handleSave} disabled={salvar.isPending}>
          {salvar.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Salvando...
            </>
          ) : existente ? (
            'Atualizar resposta'
          ) : (
            'Salvar resposta'
          )}
        </Button>
      </div>
    </div>
  )
}

interface ConteudoComentariosSectionProps {
  conteudoId: string
  usuarioId: string | undefined
  variant?: 'default' | 'book'
}

export function ConteudoComentariosSection({
  conteudoId,
  usuarioId,
  variant = 'default',
}: ConteudoComentariosSectionProps) {
  const { data: comentarios = [], isLoading } = useComentariosPublicos(conteudoId)
  const salvar = useSalvarInteracao(conteudoId, usuarioId)

  const [novoTexto, setNovoTexto] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editTexto, setEditTexto] = useState('')

  const comentariosOrdenados = [...comentarios].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const handlePublicar = async () => {
    if (!novoTexto.trim()) {
      toast.error('Escreva algo antes de publicar')
      return
    }
    try {
      await salvar.mutateAsync({
        tipo_interacao: 'comentario_livre',
        texto: novoTexto.trim(),
      })
      setNovoTexto('')
      toast.success('Comentário publicado')
    } catch {
      toast.error('Não foi possível publicar')
    }
  }

  const iniciarEdicao = (comentario: InteracaoComAutor) => {
    setEditandoId(comentario.id)
    setEditTexto(comentario.texto)
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setEditTexto('')
  }

  const handleSalvarEdicao = async () => {
    if (!editandoId || !editTexto.trim()) {
      toast.error('O comentário não pode ficar vazio')
      return
    }
    try {
      await salvar.mutateAsync({
        id: editandoId,
        tipo_interacao: 'comentario_livre',
        texto: editTexto.trim(),
      })
      cancelarEdicao()
      toast.success('Comentário atualizado')
    } catch {
      toast.error('Não foi possível atualizar')
    }
  }

  const totalLabel =
    comentarios.length === 0
      ? 'Nenhum comentário ainda'
      : comentarios.length === 1
        ? '1 comentário'
        : `${comentarios.length} comentários`

  return (
    <section id="secao-comentarios" className="scroll-mt-24 space-y-4">
      <div className={cn('flex items-center gap-3', variant === 'book' && 'book-interaction-header')}>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary',
            variant === 'book' && 'book-interaction-icon',
          )}
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h2 className={cn('text-lg font-semibold text-text', variant === 'book' && 'book-interaction-title')}>
            Comentários
          </h2>
          <p className="text-sm text-text-muted">{totalLabel}</p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            Espaço <strong className="font-medium text-text">público</strong> — todos os alunos veem. Diferente
            da sua reflexão, que é privada.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Carregando comentários...</p>
      ) : comentariosOrdenados.length > 0 ? (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-elevated-muted">
          {comentariosOrdenados.map((c) => (
            <li key={c.id}>
              <ComentarioPublicoCard
                comentario={c}
                variant={variant}
                isMine={c.usuario_id === usuarioId}
                editando={editandoId === c.id}
                editTexto={editTexto}
                onEditTexto={setEditTexto}
                onIniciarEdicao={() => iniciarEdicao(c)}
                onCancelarEdicao={cancelarEdicao}
                onSalvarEdicao={handleSalvarEdicao}
                salvando={salvar.isPending}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-sm text-text-muted">
          Ninguém comentou ainda. Seja o primeiro!
        </p>
      )}

      <div
        className={cn(
          'flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end',
          variant === 'book' && 'book-interaction-panel border-t-primary/10 pt-5',
        )}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="comentario-novo" className="sr-only">
            Escrever comentário público
          </label>
          <Textarea
            id="comentario-novo"
            rows={2}
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Escreva um comentário..."
            className="min-h-[72px] resize-none"
          />
        </div>
        <Button
          size="sm"
          className="shrink-0 sm:mb-0.5"
          onClick={handlePublicar}
          disabled={salvar.isPending || !usuarioId || !novoTexto.trim()}
        >
          {salvar.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Publicando...
            </>
          ) : (
            'Publicar'
          )}
        </Button>
      </div>
    </section>
  )
}

function ComentarioPublicoCard({
  comentario,
  variant = 'default',
  isMine = false,
  editando = false,
  editTexto = '',
  onEditTexto,
  onIniciarEdicao,
  onCancelarEdicao,
  onSalvarEdicao,
  salvando = false,
}: {
  comentario: InteracaoComAutor
  variant?: 'default' | 'book'
  isMine?: boolean
  editando?: boolean
  editTexto?: string
  onEditTexto?: (v: string) => void
  onIniciarEdicao?: () => void
  onCancelarEdicao?: () => void
  onSalvarEdicao?: () => void
  salvando?: boolean
}) {
  const nomeCompleto = comentario.profiles?.nome ?? 'Aluno'
  const nome = nomeCompleto.split(' ')[0]
  const relativo = formatRelativeTime(comentario.created_at)

  return (
    <article
      className={cn(
        'px-4 py-4 sm:px-5',
        variant === 'book' && 'book-comment-bubble mx-0 border-0 bg-transparent',
      )}
    >
      <div className="flex gap-3">
        <Avatar name={nomeCompleto} className="h-8 w-8 shrink-0 text-[10px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-semibold text-text">{nome}</p>
            <time className="text-xs text-text-muted" dateTime={comentario.created_at}>
              {relativo}
            </time>
          </div>

          {editando ? (
            <div className="mt-2 space-y-2">
              <Textarea
                rows={2}
                value={editTexto}
                onChange={(e) => onEditTexto?.(e.target.value)}
                className="min-h-[72px] resize-none"
                aria-label="Editar comentário"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onSalvarEdicao} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelarEdicao} disabled={salvando}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-text">
                {comentario.texto}
              </p>
              {isMine && (
                <button
                  type="button"
                  onClick={onIniciarEdicao}
                  className="mt-2 text-xs font-semibold text-text-muted transition-colors hover:text-primary"
                >
                  Editar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  )
}
