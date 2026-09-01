import { createFileRoute } from '@tanstack/react-router'
import { MinhasLeiturasPage } from '@/features/app/MinhasLeiturasPage'

export const Route = createFileRoute('/app/minhas-leituras')({
  component: MinhasLeiturasPage,
})
