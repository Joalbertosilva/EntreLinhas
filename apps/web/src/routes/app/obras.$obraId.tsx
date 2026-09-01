import { createFileRoute } from '@tanstack/react-router'
import { ObraPublicaPage } from '@/features/app/ObraPublicaPage'

export const Route = createFileRoute('/app/obras/$obraId')({
  component: function ObraPublicaRoute() {
    const { obraId } = Route.useParams()
    return <ObraPublicaPage obraId={obraId} />
  },
})
