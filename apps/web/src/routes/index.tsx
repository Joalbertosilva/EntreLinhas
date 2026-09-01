import { createFileRoute, redirect } from '@tanstack/react-router'
import { resolveAuthenticatedHomePath } from '@/lib/authRedirect'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const path = await resolveAuthenticatedHomePath()
    throw redirect({ to: path })
  },
})
