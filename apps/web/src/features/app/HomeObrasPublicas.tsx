import { ScrollReveal } from '@/features/app/ScrollReveal'
import { ObrasComunidadeSection } from '@/features/app/ObrasComunidadeSection'

export function HomeObrasPublicas() {
  return (
    <ScrollReveal delayMs={80}>
      <ObrasComunidadeSection limit={8} hideWhenEmpty />
    </ScrollReveal>
  )
}
