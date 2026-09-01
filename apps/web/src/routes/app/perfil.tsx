import { createFileRoute, Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { ChevronRight, LayoutDashboard, Lock, LogOut } from 'lucide-react'
import { ScrollReveal, SectionIcon } from '@/features/app'
import { useAuth } from '@/features/auth/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/perfil')({
  component: PerfilRoute,
})

function PerfilRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname.startsWith('/app/perfil/')) return <Outlet />
  return <AppPerfilPage />
}

const PERFIL_LABEL = {
  administrador: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
} as const

function AppPerfilPage() {
  const { profile, signOut, isStaff } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.navigate({ to: '/login' })
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <header className="flex items-start gap-4">
          <SectionIcon section="perfil" size="lg" />
          <div className="min-w-0 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Conta</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
              Minha conta
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Seus dados e configurações da plataforma.
            </p>
          </div>
        </header>
      </ScrollReveal>

      <ScrollReveal delayMs={40}>
        <Card className="border-primary/10 bg-white/85 backdrop-blur-sm">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold text-text">Dados da conta</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-text-muted">Nome</dt>
                <dd className="font-medium text-text">{profile.nome}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Usuário</dt>
                <dd className="font-mono text-text">{profile.nome_usuario}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Perfil</dt>
                <dd className="font-medium text-text">{PERFIL_LABEL[profile.perfil]}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
        <Card className="overflow-hidden border-primary/10 bg-white/85 p-0 backdrop-blur-sm">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-text">Preferências</h2>
          </div>
          <ul className="divide-y divide-border">
            <ProfileMenuLink
              to="/app/perfil/senha"
              icon={<Lock className="h-4 w-4 text-primary" aria-hidden />}
              label="Alterar senha"
              description="Atualize sua senha de acesso"
              activeOptions={{ exact: false }}
            />
          </ul>
        </Card>
      </ScrollReveal>

      <ScrollReveal delayMs={120}>
        <Card className="overflow-hidden border-primary/10 bg-white/85 p-0 backdrop-blur-sm">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-text">Sessão</h2>
          </div>
          <ul className="divide-y divide-border">
            {isStaff && (
              <ProfileMenuLink
                to="/admin"
                icon={<LayoutDashboard className="h-4 w-4 text-primary" aria-hidden />}
                label="Painel administrativo"
                description="Gerenciar conteúdos e usuários"
              />
            )}
            <li>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-primary-light/40"
              >
                <LogOut className="h-4 w-4 text-text-muted" aria-hidden />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-text">Encerrar sessão</span>
                  <span className="block text-xs text-text-muted">Sair da plataforma neste dispositivo</span>
                </span>
              </button>
            </li>
          </ul>
        </Card>
      </ScrollReveal>
    </div>
  )
}

function ProfileMenuLink({
  to,
  icon,
  label,
  description,
  activeOptions,
}: {
  to: string
  icon: React.ReactNode
  label: string
  description: string
  activeOptions?: { exact?: boolean }
}) {
  return (
    <li>
      <Link
        to={to}
        activeOptions={activeOptions}
        className={cn(
          'group flex items-center gap-3 px-5 py-4 transition-colors',
          'hover:bg-primary-light/40',
        )}
      >
        {icon}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-text group-hover:text-primary">{label}</span>
          <span className="block text-xs text-text-muted">{description}</span>
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </Link>
    </li>
  )
}
