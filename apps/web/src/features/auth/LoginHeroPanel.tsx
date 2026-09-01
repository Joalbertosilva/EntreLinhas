import { AnimatedBrandWordmark } from '@/features/auth/AnimatedBrandWordmark'

export function LoginHeroPanel() {
  return (
    <>
      <aside
        className="login-brand-panel relative hidden min-h-screen flex-col justify-center overflow-hidden bg-login-hero px-8 py-12 xl:px-14 lg:flex lg:w-1/2"
        aria-label="EntreLinhas"
      >
        <div className="login-brand-panel-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center xl:max-w-lg">
          <AnimatedBrandWordmark />
          <blockquote className="animated-brand-quote mt-10 max-w-sm">
            <p className="text-sm leading-relaxed text-text-muted xl:text-[0.9375rem]">
              Um espaço para ler, refletir e construir significado — página por página.
            </p>
          </blockquote>
        </div>
      </aside>

      <div className="login-brand-panel relative shrink-0 overflow-hidden bg-login-hero px-5 py-6 sm:px-8 lg:hidden">
        <div className="login-brand-panel-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[340px]">
          <AnimatedBrandWordmark compact />
        </div>
      </div>
    </>
  )
}
