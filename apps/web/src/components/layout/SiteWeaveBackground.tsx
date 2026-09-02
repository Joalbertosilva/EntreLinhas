import { SiteWeaveArt } from '@/components/layout/SiteWeaveArt'

/** Entrelaçado — apenas na tela de login */
export function LoginWeaveBackground() {
  return (
    <div className="login-weave pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <SiteWeaveArt variant="login" className="login-weave__art" />
    </div>
  )
}
