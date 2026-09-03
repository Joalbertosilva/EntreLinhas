import { redirect, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/perfil')({
  beforeLoad: () => {
    throw redirect({ to: '/app/perfil' })
  },
  component: () => null,
})
