import { createFileRoute } from '@tanstack/react-router'
import { ProgressoPage } from '@/features/app/ProgressoPage'

export const Route = createFileRoute('/app/progresso')({
  component: ProgressoPage,
})
