import { Link } from '@tanstack/react-router'
import { BRAND_INSTITUTION, BRAND_NAME } from '@/features/auth/brand'

export function AuthLegalFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="auth-legal-footer px-1 py-1 text-center text-xs lg:text-left">
      <p className="auth-legal-footer__copy">
        © {year} {BRAND_NAME} · {BRAND_INSTITUTION}
      </p>
      <p className="auth-legal-footer__policy mt-1.5">
        <Link to="/privacidade" className="auth-legal-footer__link">
          Política de privacidade
        </Link>
      </p>
    </footer>
  )
}
