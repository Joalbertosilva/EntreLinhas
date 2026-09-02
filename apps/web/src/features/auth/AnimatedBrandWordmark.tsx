import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { cn } from '@/lib/utils'

interface AnimatedBrandWordmarkProps {
  compact?: boolean
  className?: string
}

/** Logo da marca — entrada suave, sem animação repetitiva de escala. */
export function AnimatedBrandWordmark({ compact = false, className }: AnimatedBrandWordmarkProps) {
  return (
    <div className={cn('animated-brand', compact && 'animated-brand-compact', className)}>
      <div className="animated-brand-logo-wrap mx-auto">
        <BrandLogo
          variant="full"
          className={cn(
            'animated-brand-logo mx-auto',
            compact ? 'max-w-[200px]' : 'max-w-[280px] sm:max-w-[320px]',
          )}
        />
      </div>

      {!compact && (
        <p className="animated-brand-institution mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted/80">
          {BRAND_INSTITUTION}
        </p>
      )}

      <span className="sr-only">
        {BRAND_NAME} — {BRAND_TAGLINE}
      </span>
    </div>
  )
}
