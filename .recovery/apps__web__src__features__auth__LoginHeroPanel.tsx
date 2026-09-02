import { BookOpen, Feather, Sparkles } from 'lucide-react'
import { AnimatedBrandWordmark } from '@/features/auth/AnimatedBrandWordmark'
import { LoginHeroDecorations } from '@/features/auth/LoginHeroDecorations'

const PILLARS = [
  { icon: BookOpen, label: 'Leitura' },
  { icon: Feather, label: 'Reflexão' },
  { icon: Sparkles, label: 'Sentido' },
] as const

function HeroContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative mx-auto flex w-full flex-col items-center text-center xl:max-w-lg">
      <AnimatedBrandWordmark compact={compact} className={compact ? 'max-w-[340px]' : 'max-w-md xl:max-w-lg'} />

      {!compact && (
        <>
          <ul className="animated-brand-quote mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {PILLARS.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-navy/10 bg-white/55 px-3 py-1 text-xs font-medium text-brand-navy/85 shadow-[var(--shadow-soft)] backdrop-blur-sm">
                  <Icon className="h-3.5 w-3.5 text-primary/75" strokeWidth={1.75} aria-hidden />
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <blockquote className="animated-brand-quote mt-8 max-w-sm px-1">
            <p className="text-sm leading-relaxed text-brand-navy/85 xl:text-[0.9375rem]">
              Um espaço para{' '}
              <span className="font-semibold text-brand-navy">ler com calma</span>,{' '}
              <span className="font-semibold text-brand-navy">refletir com profundidade</span> e{' '}
              <span className="font-semibold text-brand-navy">construir sentido</span> — página por página.
            </p>
          </blockquote>
        </>
      )}
    </div>
  )
}

export function LoginHeroPanel() {
  return (
    <>
      <aside
        className="login-brand-panel relative hidden min-h-screen flex-col justify-center overflow-hidden bg-login-hero px-8 py-12 xl:px-14 lg:flex lg:w-1/2"
        aria-label="EntreLinhas"
      >
        <LoginHeroDecorations />
        <div className="login-brand-panel-glow pointer-events-none absolute inset-0" aria-hidden />
        <HeroContent />
      </aside>

      <div className="login-brand-panel relative shrink-0 overflow-hidden bg-login-hero px-5 py-6 sm:px-8 lg:hidden">
        <LoginHeroDecorations />
        <div className="login-brand-panel-glow pointer-events-none absolute inset-0" aria-hidden />
        <HeroContent compact />
      </div>
    </>
  )
}
