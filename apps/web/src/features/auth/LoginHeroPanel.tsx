import { LoginHeroDecorations } from '@/features/auth/LoginHeroDecorations'

const HERO_IMAGE = '/images/login-illustration.png'
const IMAGE_WIDTH = 476
const IMAGE_HEIGHT = 390

function HeroQuote({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <blockquote className={className}>
      {!compact && <div className="mx-auto mb-3.5 h-px w-10 bg-brand-gold/40" aria-hidden />}
      <p
        className={
          compact
            ? 'text-sm font-medium leading-relaxed text-text'
            : 'text-[1.05rem] font-medium leading-relaxed text-text xl:text-lg'
        }
      >
        Entre as páginas, encontramos sentidos que nos transformam.
      </p>
      {!compact && (
        <footer className="mt-2 text-sm leading-relaxed text-text-muted">
          Um espaço para ler, refletir e construir significado.
        </footer>
      )}
    </blockquote>
  )
}

function HeroVisual() {
  return (
    <figure className="relative mx-auto w-full max-w-[520px] xl:max-w-[560px]">
      <LoginHeroDecorations />

      <div className="relative flex justify-center px-2 sm:px-4">
        <div className="relative">
          <div
            className="pointer-events-none absolute -bottom-3 left-[12%] right-[12%] h-8 rounded-full bg-brand-navy/10 blur-xl"
            aria-hidden
          />
          <img
            src={HERO_IMAGE}
            alt="Ilustração de criança lendo sentada sobre livros"
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            className="relative z-[1] block h-auto w-full max-w-[480px] drop-shadow-[0_8px_24px_rgb(0_51_102_/_0.08)]"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </figure>
  )
}

export function LoginHeroPanel() {
  return (
    <>
      <aside
        className="relative hidden min-h-screen flex-col justify-center overflow-hidden bg-login-hero px-8 py-10 xl:px-12 xl:py-12 lg:flex lg:w-1/2"
        aria-label="Leitura e reflexão"
      >
        <div className="relative mx-auto flex w-full max-w-[560px] flex-col">
          <HeroVisual />
          <HeroQuote className="mt-5 text-center xl:mt-6" />
        </div>
      </aside>

      <div className="relative shrink-0 overflow-hidden bg-login-hero px-5 py-5 sm:px-8 sm:py-6 lg:hidden">
        <div className="relative mx-auto max-w-[380px]">
          <HeroVisual />
          <HeroQuote className="mt-4 text-center" compact />
        </div>
      </div>
    </>
  )
}
