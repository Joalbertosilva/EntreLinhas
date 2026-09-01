import { createFileRoute } from '@tanstack/react-router'
import { MinhaObraEditorPage } from '@/features/app/MinhaObraEditorPage'

export const Route = createFileRoute('/app/minha-obra')({
  component: MinhaObraEditorPage,
})
