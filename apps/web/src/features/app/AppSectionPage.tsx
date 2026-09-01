import { Link } from '@tanstack/react-router'
import type { AppNavItem } from '@/features/app/appNavigation'
import { ContentCarousel } from '@/features/app/ContentCarousel'
import { ScrollReveal } from '@/features/app/ScrollReveal'
import { SectionIcon } from '@/features/app/SectionIcon'
import { useConteudosByTipo } from '@/features/app/useConteudos'
import { Card, CardContent } from '@/components/ui/Card'

interface AppSectionPageProps {
  item: AppNavItem
}

export function AppSectionPage({ item }: AppSectionPageProps) {
  if (!item.tipo || !item.placeholderCount) return null

  const { data: conteudos = [], isLoading } = useConteudosByTipo(item.tipo)
  const isEmpty = !isLoading && conteudos.length === 0

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <header className="flex items-start gap-4">
          <SectionIcon section={item.id} size="lg" />
          <div className="min-w-0 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Explorar
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
              {item.label}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted sm:text-[15px]">
              {item.description}
            </p>
          </div>
        </header>
      </ScrollReveal>

      {isEmpty && (
        <ScrollReveal delayMs={60}>
          <Card className="border-dashed border-primary/12 bg-white/75 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm text-text-muted">
                Ainda não há{' '}
                <strong className="font-medium text-text">{item.label.toLowerCase()}</strong>{' '}
                disponíveis. Quando a equipe cadastrar novos materiais, eles aparecerão aqui.
                Enquanto isso, explore a{' '}
                <Link to="/app" className="font-semibold text-primary hover:underline">
                  página inicial
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      )}

      <ScrollReveal delayMs={isEmpty ? 120 : 60}>
        <ContentCarousel
          section={{
            id: item.id,
            title: item.label,
            subtitle: item.description,
            tipo: item.tipo,
            placeholderCount: item.placeholderCount,
            route: item.to,
          }}
          showViewAll={false}
        />
      </ScrollReveal>
    </div>
  )
}
