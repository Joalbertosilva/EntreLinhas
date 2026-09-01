import { createFileRoute } from '@tanstack/react-router'
import { AppConteudoDetailPage } from '@/features/app/AppConteudoDetailPage'

export const Route = createFileRoute('/app/conteudos/$conteudoId')({
  component: AppConteudoDetailRoute,
})

function AppConteudoDetailRoute() {
  const { conteudoId } = Route.useParams()
  return <AppConteudoDetailPage conteudoId={conteudoId} />
}
