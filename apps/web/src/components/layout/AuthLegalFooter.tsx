import { Link } from '@tanstack/react-router'
import { BRAND_INSTITUTION, BRAND_NAME } from '@/features/auth/brand'

export function AuthLegalFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-primary/10 px-6 py-3.5 text-center text-xs text-text-muted">
      <p>
        © {year} {BRAND_NAME} · {BRAND_INSTITUTION}
      </p>
      <p className="mt-1.5">
        <Link to="/privacidade" className="font-medium text-primary hover:underline">
          Política de privacidade
        </Link>
      </p>
    </footer>
  )
}
