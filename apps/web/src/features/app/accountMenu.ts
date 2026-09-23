import type { LucideIcon } from 'lucide-react'
import { BookOpen, LayoutDashboard, Lock, PenLine, Sparkles, User } from 'lucide-react'

export const PERFIL_LABELS = {
  administrador: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
} as const

export interface AccountMenuItem {
  to: string
  label: string
  description?: string
  icon: LucideIcon
  staffOnly?: boolean
}

export const ACCOUNT_MENU_ITEMS: AccountMenuItem[] = [
  {
    to: '/app/progresso',
    label: 'Minha jornada',
    description: 'XP, níveis e faixas de leitura',
    icon: Sparkles,
  },
  {
    to: '/app/minhas-leituras',
    label: 'Minhas leituras',
    description: 'Em andamento, lista e concluídas',
    icon: BookOpen,
  },
  {
    to: '/app/minha-obra',
    label: 'Minha obra',
    description: 'Escrever e publicar na comunidade',
    icon: PenLine,
  },
  {
    to: '/app/perfil/senha',
    label: 'Alterar senha',
    description: 'Atualize sua senha de acesso',
    icon: Lock,
  },
  {
    to: '/app/perfil',
    label: 'Dados da conta',
    description: 'Nome, usuário e perfil de acesso',
    icon: User,
  },
]

export const ADMIN_ACCOUNT_ITEM: AccountMenuItem = {
  to: '/admin',
  label: 'Painel administrativo',
  description: 'Gerenciar conteúdos e usuários',
  icon: LayoutDashboard,
  staffOnly: true,
}
