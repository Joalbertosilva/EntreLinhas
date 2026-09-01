import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Conteudo } from '@tcc-sistema/types'
import { useMinhaCurtida, useToggleCurtida } from '@/features/app/useConteudoEngagement'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface ConteudoCurtidasPanelProps {
  conteudo: Conteudo
  usuarioId: string | undefined
}

export function ConteudoCurtidasPanel({ conteudo, usuarioId }: ConteudoCurtidasPanelProps) {
  const { data: minhaCurtida, isLoading } = useMinhaCurtida(conteudo.id, usuarioId)
  const toggle = useToggleCurtida(conteudo.id, usuarioId)
  const curtido = Boolean(minhaCurtida)

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync(curtido)
      toast.success(curtido ? 'Curtida removida' : 'Você curtiu este conteúdo')
    } catch {
      toast.error('Não foi possível registrar sua curtida')
    }
  }

  const curtidas = conteudo.curtidas_count ?? 0

  return (
    <Card className="border-primary/10 bg-white/82 backdrop-blur-sm">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-semibold text-text">Gostou deste conteúdo?</p>
          <p className="mt-0.5 text-sm text-text-muted">
            {curtidas === 1
              ? '1 pessoa curtiu'
              : `${curtidas} pessoas curtiram`}
            {curtidas > 0 && ' — conteúdos mais curtidos aparecem em Destaques'}
          </p>
        </div>
        <Button
          variant={curtido ? 'primary' : 'outline'}
          size="sm"
          disabled={isLoading || toggle.isPending}
          onClick={handleToggle}
          className={cn(curtido && 'bg-primary')}
        >
          {toggle.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Heart className={cn('h-4 w-4', curtido && 'fill-current')} aria-hidden />
          )}
          {curtido ? 'Curtido' : 'Curtir'}
        </Button>
      </CardContent>
    </Card>
  )
}
