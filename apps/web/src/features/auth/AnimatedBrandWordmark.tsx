import type { CSSProperties, ReactNode } from 'react'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { cn } from '@/lib/utils'

interface AnimatedBrandWordmarkProps {
  compact?: boolean
  className?: string
}

function AnimatedLetters({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {text.split('').map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={cn(
            'animated-brand-letter',
          )}
          style={{ '--letter-i': index } as CSSProperties}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

export function AnimatedBrandWordmark({ compact = false, className }: AnimatedBrandWordmarkProps) {
  return (
    <div className={cn('animated-brand', compact && 'animated-brand-compact', className)}>
      <div className="animated-brand-logo-wrap mx-auto">
        <BrandLogo
          variant="full"
          className={cn(
            'animated-brand-logo mx-auto',
            compact ? 'max-w-[240px]' : 'max-w-[280px] sm:max-w-[320px]',
          )}
        />
      </div>

      <p
        className={cn(
          'animated-brand-tagline mt-5 font-medium leading-snug text-primary/90',
          compact ? 'text-sm' : 'text-base sm:text-lg',
        )}
      >
        <AnimatedLetters text={BRAND_TAGLINE} />
      </p>

      {!compact && (
        <p className="animated-brand-institution mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted/80">
          {BRAND_INSTITUTION}
        </p>
      )}

      <div className="animated-brand-lines mx-auto mt-6 flex flex-col gap-1.5" aria-hidden>
        <span className="animated-brand-line w-16" />
        <span className="animated-brand-line animated-brand-line-delay w-24" />
        <span className="animated-brand-line animated-brand-line-delay-2 w-12" />
      </div>

      <span className="sr-only">{BRAND_NAME} — {BRAND_TAGLINE}</span>
    </div>
  )
}

/** Letras flutuantes reutilizáveis (ex.: citação no hero) */
export function AnimatedLetterLine({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('animated-letter-line', className)}>{children}</p>
}

export { AnimatedLetters }
