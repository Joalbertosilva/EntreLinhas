import { createFileRoute } from '@tanstack/react-router'
import { SobrePage } from '@/features/app/SobrePage'

export const Route = createFileRoute('/app/sobre')({
  component: SobrePage,
})
