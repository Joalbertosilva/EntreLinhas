import { createFileRoute } from '@tanstack/react-router'
import { AppSectionPage, getNavItem } from '@/features/app'

export const Route = createFileRoute('/app/poemas')({
  component: () => <AppSectionPage item={getNavItem('poemas')!} />,
})
