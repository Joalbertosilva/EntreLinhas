import { Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { ObraPublicaDetailPage } from '@/features/app/ObraPublicaDetailPage'
import { useObraPublica } from '@/features/app/useMinhaObra'
import { useAuth } from '@/features/auth/AuthProvider'

interface ObraPublicaPageProps {
  obraId: string
}

export function ObraPublicaPage({ obraId }: ObraPublicaPageProps) {
  const { profile } = useAuth()
  const { data: obra, isLoading, error } = useObraPublica(obraId)

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Carregando obra…
      </p>
    )
  }

  if (error || !obra) {
    return (
      <div className="rounded-2xl border border-border bg-elevated p-8 text-center">
        <p className="text-text-muted">Esta obra não está disponível ou foi despublicada.</p>
        <Link to="/app" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Voltar ao início
        </Link>
      </div>
    )
  }

  return <ObraPublicaDetailPage obra={obra} usuarioId={profile?.id} />
}
