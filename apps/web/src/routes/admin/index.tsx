import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, GraduationCap, KeyRound, Library, Plus, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

const STAT_TINTS = [
  'bg-primary-light/80 border-primary/10',
  'bg-accent-light/70 border-accent/20',
  'bg-primary-light/60 border-primary/10',
  'bg-accent-light/50 border-accent/15',
] as const

function AdminDashboard() {
  const { profile, isAdmin, isStaff } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['visao-administrativa'],
    queryFn: async () => {
      const { data, error } = await supabase.from('visao_administrativa').select('*').single()
      if (error) throw error
      return data
    },
    enabled: isAdmin,
  })

  const firstName = profile?.nome.split(' ')[0]

  return (
    <>
      <PageHeader
        welcome
        title={`Olá, ${firstName}`}
        description={
          isAdmin
            ? 'Gerencie conteúdos, usuários e acompanhe a plataforma dos alunos.'
            : 'Organize materiais de leitura e acompanhe seus alunos.'
        }
      />

      <Card className="mb-6 border-primary/10 bg-gradient-to-br from-primary-light/50 to-white">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">Por onde começar?</p>
            <p className="mt-1 text-sm text-text-muted">
              Cadastre conteúdos para os alunos ou acesse a plataforma para ver como eles enxergam
              a biblioteca.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/conteudos">
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4" />
                Novo conteúdo
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="outline" size="sm">
                Ver plataforma
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:mb-8 sm:gap-3 md:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="m-4 h-10 sm:m-5" />
              </Card>
            ))
          ) : stats ? (
            <>
              <StatPill label="Usuários" value={stats.quantidade_usuarios} tint={STAT_TINTS[0]} />
              <StatPill label="Alunos" value={stats.quantidade_alunos} tint={STAT_TINTS[1]} />
              <StatPill
                label="Professores"
                value={stats.quantidade_professores}
                tint={STAT_TINTS[2]}
                className="hidden sm:block"
              />
              <StatPill label="Conteúdos" value={stats.quantidade_conteudos} tint={STAT_TINTS[3]} />
            </>
          ) : null}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-muted sm:mb-4">Acesso rápido</h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <NavCard
            to="/admin/conteudos"
            icon={<Library className="h-5 w-5 text-primary" />}
            iconBg="bg-primary-light"
            title="Conteúdos"
            description="Livros, crônicas, poemas e materiais"
            action={
              <Link to="/admin/conteudos">
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4" />
                  Novo
                </Button>
              </Link>
            }
          />

          {isStaff && (
            <NavCard
              to="/admin/alunos"
              icon={<GraduationCap className="h-5 w-5 text-primary" />}
              iconBg="bg-accent-light"
              title="Alunos"
              description="Progresso de leitura e atividade"
            />
          )}

          {isStaff && (
            <NavCard
              to="/admin/requerimentos-senha"
              icon={<KeyRound className="h-5 w-5 text-primary" />}
              iconBg="bg-primary-light"
              title="Recuperação de senha"
              description="Solicitações de alunos"
            />
          )}

          {isAdmin && (
            <NavCard
              to="/admin/usuarios"
              icon={<Users className="h-5 w-5 text-primary" />}
              iconBg="bg-primary-light"
              title="Usuários"
              description="Cadastro de alunos e professores"
            />
          )}

          {!isAdmin && stats === undefined && (
            <NavCard
              to="/admin/conteudos"
              icon={<BookOpen className="h-5 w-5 text-primary" />}
              iconBg="bg-accent-light"
              title="Seus conteúdos"
              description="Tudo que você publicou para os alunos"
            />
          )}
        </div>
      </section>
    </>
  )
}

function StatPill({
  label,
  value,
  tint,
  className,
}: {
  label: string
  value: number
  tint: string
  className?: string
}) {
  return (
    <Card className={cn('card-lift border', tint, className)}>
      <CardContent className="p-4 sm:p-5">
        <p className="text-[0.6875rem] font-medium text-text-muted sm:text-xs">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-text sm:mt-1 sm:text-2xl">{value}</p>
      </CardContent>
    </Card>
  )
}

function NavCard({
  to,
  icon,
  iconBg,
  title,
  description,
  action,
  className,
}: {
  to: string
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('card-lift group', className)}>
      <CardContent className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10', iconBg)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text sm:text-base">{title}</p>
          <p className="mt-0.5 text-xs text-text-muted sm:text-sm">{description}</p>
          <div className="mt-2 flex items-center justify-between sm:mt-3">
            {action ?? (
              <Link
                to={to}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover sm:text-sm"
              >
                Abrir
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
