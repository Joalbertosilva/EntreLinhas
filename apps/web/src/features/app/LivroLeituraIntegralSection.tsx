import { BookOpen, Lock, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Conteudo, StatusLeitura, StatusLeituraIntegral } from '@tcc-sistema/types'
import { BookPaginatedReader } from '@/features/app/BookPaginatedReader'
import { buildIntegralBookPages, getIntegralBookPageStorageKey } from '@/features/app/bookPagination'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import {
  mensagemLeituraIntegralBloqueada,
  podeAcessarLeituraIntegral,
} from '@/features/app/leituraIntegral'
import { useAtualizarLeituraIntegral, useCapitulosIntegral } from '@/features/app/useLeituraIntegral'
import { Button } from '@/components/ui/Button'
import { Speakable } from '@/features/accessibility/Speakable'
import { cn } from '@/lib/utils'

interface LivroLeituraIntegralSectionProps {
  conteudo: Conteudo
  conteudoId: string
  usuarioId: string | undefined
  statusEstudo: StatusLeitura | null | undefined
  integralStatus: StatusLeituraIntegral | null | undefined
}

export function LivroLeituraIntegralSection({
  conteudo,
  conteudoId,
  usuarioId,
  statusEstudo,
  integralStatus,
}: LivroLeituraIntegralSectionProps) {
  const showBlock = Boolean(conteudo.integral_ativa)
  const { data: capitulos = [], isLoading } = useCapitulosIntegral(conteudoId, showBlock)
  const atualizarIntegral = useAtualizarLeituraIntegral(conteudoId, usuarioId)

  if (!showBlock) return null

  const desbloqueado = podeAcessarLeituraIntegral(conteudo, statusEstudo, capitulos.length)
  const mensagemBloqueio = mensagemLeituraIntegralBloqueada(conteudo, statusEstudo, capitulos.length)
  const coverUrl = resolveConteudoCoverUrl(conteudo)
  const pages = buildIntegralBookPages(
    {
      titulo: conteudo.titulo,
      autor: conteudo.autor,
      coverUrl,
      creditoTraducao: conteudo.integral_traducao_credito,
    },
    capitulos.map((c) => ({
      id: c.id,
      ordem: c.ordem,
      titulo: c.titulo,
      texto: c.texto_pt,
    })),
  )
  const credito = conteudo.integral_traducao_credito?.trim() || 'EntreLinhas'

  const handleIniciarIntegral = async () => {
    if (integralStatus) return
    try {
      await atualizarIntegral.mutateAsync('em_andamento')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível iniciar a leitura integral')
    }
  }

  const handleConcluirIntegral = async () => {
    if (integralStatus === 'concluido') return
    try {
      await atualizarIntegral.mutateAsync('concluido')
      toast.success('Você concluiu a leitura integral desta obra!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível registrar a conclusão')
    }
  }

  return (
    <section id="leitura-integral" className="scroll-mt-24 space-y-5" aria-labelledby="leitura-integral-title">
      <div className="book-info-card">
        <div className="book-info-card-summary">
          <div className="book-info-card-spine" aria-hidden />
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {desbloqueado ? (
              <BookOpen className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            ) : (
              <Lock className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="leitura-integral-title" className="font-semibold text-brand-navy">
              Leitura integral
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Obra completa · tradução {credito}
              {capitulos.length > 0 ? ` · ${capitulos.length} capítulos` : ''}
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-text-muted">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
          Carregando capítulos…
        </p>
      )}

      {!isLoading && mensagemBloqueio && (
        <Speakable label={mensagemBloqueio}>
          <p className="rounded-2xl border border-primary/15 bg-primary-light/30 px-4 py-3 text-sm text-text">
            {mensagemBloqueio}
          </p>
        </Speakable>
      )}

      {!isLoading && desbloqueado && (
        <div className="space-y-4">
          {!integralStatus && (
            <Button
              type="button"
              onClick={() => void handleIniciarIntegral()}
              disabled={atualizarIntegral.isPending}
              className="rounded-full"
            >
              {atualizarIntegral.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              Começar leitura integral
            </Button>
          )}

          {integralStatus && pages.length > 0 && (
            <>
              <p className="text-xs text-text-muted">
                Use <strong className="text-text">Modo leitura</strong> para abrir a página branca em tela cheia,
                estilo e-reader.
              </p>
              <BookPaginatedReader
                pages={pages}
                conteudoId={conteudoId}
                titulo={`${conteudo.titulo} — integral`}
                storageKey={getIntegralBookPageStorageKey(conteudoId)}
                allowImmersive
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={integralStatus === 'concluido' ? 'outline' : 'primary'}
                  className="rounded-full"
                  disabled={integralStatus === 'concluido' || atualizarIntegral.isPending}
                  onClick={() => void handleConcluirIntegral()}
                >
                  {integralStatus === 'concluido' ? 'Integral concluída' : 'Marcar integral como concluída'}
                </Button>
                {integralStatus === 'concluido' && (
                  <span className={cn('self-center text-xs font-medium text-primary')}>
                    Bônus de XP aplicado
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}