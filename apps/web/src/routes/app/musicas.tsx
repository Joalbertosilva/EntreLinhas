import { createFileRoute } from '@tanstack/react-router'
import { AppSectionPage, getNavItem } from '@/features/app'

export const Route = createFileRoute('/app/musicas')({
  component: () => <AppSectionPage item={getNavItem('musicas')!} />,
})
