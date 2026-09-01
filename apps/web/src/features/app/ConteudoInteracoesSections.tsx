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
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
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
      <Card className="border-dashed border-primary/15 bg-white/75">
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
    <div className={cn(variant === 'book' ? 'book-interaction-panel' : 'overflow-hidden rounded-2xl border border-primary/10 bg-white/90 shadow-[var(--shadow-soft)]')}>
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
            <p className="mt-2 text-sm leading-relaxed text-text">{reflexao}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Pergunta</p>
          <p className="mt-2 text-sm font-semibold leading-snug text-text sm:text-[15px]">{pergunta}</p>
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
            className="min-h-[100px] resize-y bg-white"
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
  const { data: minhas = [] } = useMinhasInteracoes(conteudoId, usuarioId)
  const salvar = useSalvarInteracao(conteudoId, usuarioId)

  const meuComentario = minhas.find((i) => i.tipo_interacao === 'comentario_livre')
  const [texto, setTexto] = useState('')

  useEffect(() => {
    setTexto(meuComentario?.texto ?? '')
  }, [meuComentario?.texto, meuComentario?.id])

  const outrosComentarios = comentarios.filter((c) => c.usuario_id !== usuarioId)

  const handleSave = async () => {
    if (!texto.trim()) {
      toast.error('Escreva um comentário antes de publicar')
      return
    }
    try {
      await salvar.mutateAsync({
        id: meuComentario?.id,
        tipo_interacao: 'comentario_livre',
        texto,
      })
      toast.success(meuComentario ? 'Comentário atualizado' : 'Comentário publicado')
    } catch {
      toast.error('Não foi possível publicar seu comentário')
    }
  }

  return (
    <section id="secao-comentarios" className="scroll-mt-24 space-y-4">
      <div className={cn('flex items-start gap-3', variant === 'book' && 'book-interaction-header')}>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary',
            variant === 'book' && 'book-interaction-icon',
          )}
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h2 className={cn('text-lg font-semibold text-brand-navy', variant === 'book' && 'book-interaction-title')}>
            Comentários
          </h2>
          <p className="text-sm text-text-muted">
            Visíveis para todos os alunos — compartilhe o que achou da leitura.
          </p>
        </div>
      </div>

      <div className={cn(variant === 'book' ? 'book-interaction-panel space-y-3' : 'rounded-2xl border border-primary/10 bg-white/85 p-5 backdrop-blur-sm sm:p-6')}>
          <label htmlFor="comentario-publico" className="text-sm font-medium text-text">
            Seu comentário
          </label>
          <Textarea
            id="comentario-publico"
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="O que você achou deste conteúdo?"
          />
          <Button size="sm" onClick={handleSave} disabled={salvar.isPending}>
            {salvar.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Publicando...
              </>
            ) : meuComentario ? (
              'Atualizar comentário'
            ) : (
              'Publicar comentário'
            )}
          </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Carregando comentários...</p>
      ) : outrosComentarios.length > 0 ? (
        <div className="space-y-3">
          {outrosComentarios.map((c) => (
            <ComentarioPublicoCard key={c.id} comentario={c} variant={variant} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Seja o primeiro a comentar.</p>
      )}
    </section>
  )
}

function ComentarioPublicoCard({
  comentario,
  variant = 'default',
}: {
  comentario: InteracaoComAutor
  variant?: 'default' | 'book'
}) {
  const nome = comentario.profiles?.nome?.split(' ')[0] ?? 'Aluno'
  const data = new Date(comentario.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })

  return (
    <div className={cn(variant === 'book' ? 'book-comment-bubble' : 'rounded-2xl border border-primary/8 bg-white/80 p-4 sm:p-5')}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text">{nome}</p>
          <time className="text-xs text-text-muted" dateTime={comentario.created_at}>
            {data}
          </time>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
          {comentario.texto}
        </p>
    </div>
  )
}
