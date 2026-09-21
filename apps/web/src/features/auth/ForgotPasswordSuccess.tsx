import { CheckCircle2 } from 'lucide-react'
import { AuthBackLink } from '@/features/auth/AuthBackLink'

export function ForgotPasswordSuccess() {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-light">
        <CheckCircle2 className="h-6 w-6 text-brand-navy" strokeWidth={1.75} aria-hidden />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-text">Pedido enviado</h2>
        <p className="text-base leading-relaxed text-text-muted">
          Se o usuário estiver cadastrado, seu pedido foi registrado.
          Avise seu <strong className="font-medium text-text">professor ou administrador</strong> —
          eles verão a solicitação e redefinirão sua senha com você por perto.
        </p>
      </div>

      <AuthBackLink to="/login" label="Voltar ao login" className="inline-flex" />
    </div>
  )
}
