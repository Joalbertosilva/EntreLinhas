import type { LucideIcon } from 'lucide-react'
import { BookOpen, Info, LayoutDashboard, Lock, PenLine, Sparkles, User } from 'lucide-react'

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
    to: '/app/perfil',
    label: 'Minha conta',
    description: 'Seus dados e preferências',
    icon: User,
  },
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
    to: '/app/sobre',
    label: 'Sobre a plataforma',
    description: 'Créditos, versão e suporte',
    icon: Info,
  },
]

/** Atalho só na página Minha conta (fora do menu do avatar). */
export const PERFIL_SENHA_MENU_ITEM: AccountMenuItem = {
  to: '/app/perfil/senha',
  label: 'Alterar senha',
  description: 'Atualize sua senha de acesso',
  icon: Lock,
}

export const ADMIN_ACCOUNT_ITEM: AccountMenuItem = {
  to: '/admin',
  label: 'Painel administrativo',
  description: 'Gerenciar conteúdos e usuários',
  icon: LayoutDashboard,
  staffOnly: true,
}
