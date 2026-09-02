import { LoginBrand } from '@/features/auth/LoginBrand'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/features/auth/brand'

/** Hero do login — logo + identidade EntreLinhas (desktop) */
export function LoginHeroPanel() {
  return (
    <aside
      className="login-brand-panel relative hidden min-h-0 w-full flex-col justify-center px-8 py-10 xl:px-16 lg:flex lg:min-h-screen lg:w-1/2 lg:shrink-0 lg:grow-0"
      aria-label={BRAND_NAME}
    >
      <div className="mx-auto w-full max-w-md lg:mx-0 lg:pl-6 xl:pl-10">
        <LoginBrand className="mx-0 max-w-[260px]" />
        <p className="login-hero-tagline mt-5 text-lg font-medium text-brand-navy">{BRAND_TAGLINE}</p>
        <p className="login-hero-institution mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          {BRAND_INSTITUTION}
        </p>
      </div>
    </aside>
  )
}
