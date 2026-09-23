import type { LucideIcon } from 'lucide-react-native'
import {
  BookOpen,
  ExternalLink,
  Home,
  Library,
  Lock,
  PenLine,
  Search,
  Sparkles,
  Type,
  User,
} from 'lucide-react-native'

export const PERFIL_LABELS = {
  administrador: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
} as const

export interface AccountMenuItem {
  href: string
  label: string
  hint?: string
  icon: LucideIcon
  staffOnly?: boolean
  action?: 'accessibility' | 'admin-panel'
}

export interface DrawerNavItem {
  href: string
  label: string
  hint?: string
  icon: LucideIcon
}

export const ACCOUNT_MENU_ITEMS: AccountMenuItem[] = [
  {
    href: '/(aluno)/progresso',
    label: 'Minha jornada',
    hint: 'XP, níveis e faixas de leitura',
    icon: Sparkles,
  },
  {
    href: '/(aluno)/(tabs)/leituras',
    label: 'Minhas leituras',
    hint: 'Em andamento, lista e concluídas',
    icon: BookOpen,
  },
  {
    href: '/(aluno)/minha-obra',
    label: 'Minha obra',
    hint: 'Escrever e publicar na comunidade',
    icon: PenLine,
  },
  {
    href: '/(aluno)/alterar-senha',
    label: 'Alterar senha',
    hint: 'Atualize sua senha de acesso',
    icon: Lock,
  },
  {
    href: '/(aluno)/perfil',
    label: 'Dados da conta',
    hint: 'Nome, usuário e perfil de acesso',
    icon: User,
  },
  {
    href: '',
    label: 'Acessibilidade',
    hint: 'Texto maior e leitura em voz alta',
    icon: Type,
    action: 'accessibility',
  },
]

export const ADMIN_ACCOUNT_ITEM: AccountMenuItem = {
  href: '',
  label: 'Painel administrativo',
  hint: 'Gerenciar conteúdos e usuários na web',
  icon: ExternalLink,
  staffOnly: true,
  action: 'admin-panel',
}

export const DRAWER_MAIN_LINKS: DrawerNavItem[] = [
  { href: '/(aluno)/(tabs)', label: 'Início', hint: 'Destaques e sua jornada', icon: Home },
  { href: '/(aluno)/(tabs)/explorar', label: 'Explorar', hint: 'Catálogo completo', icon: Library },
  { href: '/(aluno)/(tabs)/leituras', label: 'Minhas leituras', hint: 'Em andamento e concluídas', icon: BookOpen },
  { href: '/(aluno)/(tabs)/pesquisa', label: 'Pesquisar', hint: 'Buscar títulos e autores', icon: Search },
]

export const DRAWER_CONTENT_LINKS: DrawerNavItem[] = [
  { href: '/(aluno)/(tabs)/explorar?tipo=livro', label: 'Livros', icon: BookOpen },
  { href: '/(aluno)/(tabs)/explorar?tipo=cronica', label: 'Crônicas', icon: BookOpen },
  { href: '/(aluno)/(tabs)/explorar?tipo=musica', label: 'Músicas', icon: BookOpen },
  { href: '/(aluno)/(tabs)/explorar?tipo=poema', label: 'Poemas', icon: BookOpen },
]

export const DRAWER_ACCOUNT_LINKS: DrawerNavItem[] = [
  { href: '/(aluno)/progresso', label: 'Minha jornada', hint: 'XP e níveis', icon: Sparkles },
  { href: '/(aluno)/minha-obra', label: 'Minha obra', hint: 'Escrever e publicar', icon: PenLine },
  { href: '/(aluno)/perfil', label: 'Minha conta', hint: 'Dados e preferências', icon: User },
]
