import { createFileRoute } from '@tanstack/react-router'
import { AppSectionPage, getNavItem } from '@/features/app'

export const Route = createFileRoute('/app/livros')({
  component: () => <AppSectionPage item={getNavItem('livros')!} />,
})
