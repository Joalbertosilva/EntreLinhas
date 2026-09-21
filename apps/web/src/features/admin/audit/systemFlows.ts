import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  LogIn,
  Pencil,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'

export type SystemFlowId = 'senha' | 'usuarios' | 'conteudos'

export type FlowActor = 'aluno' | 'sistema' | 'staff'

export interface FlowStep {
  id: string
  title: string
  description: string
  actor: FlowActor
  actorLabel: string
  icon: LucideIcon
  acoes: string[]
  link?: { to: string; label: string }
  usePending?: boolean
  branch?: 'main' | 'fork-left' | 'fork-right'
}

export interface SystemFlowDefinition {
  id: SystemFlowId
  label: string
  description: string
  icon: LucideIcon
  steps: FlowStep[]
  legendAcoes: string[]
}

export const SYSTEM_FLOWS: SystemFlowDefinition[] = [
  {
    id: 'senha',
    label: 'Recuperação de senha',
    description: 'Do pedido do aluno até a troca da senha no perfil ou no primeiro acesso.',
    icon: KeyRound,
    steps: [
      {
        id: 'solicitacao',
        title: 'Aluno solicita recuperação',
        description:
          'Formulário “Esqueci minha senha”. Resposta genérica — não revela se o usuário existe.',
        actor: 'aluno',
        actorLabel: 'Aluno',
        icon: KeyRound,
        acoes: ['senha.solicitacao'],
        link: { to: '/esqueci-senha', label: 'Tela do aluno' },
        branch: 'main',
      },
      {
        id: 'fila',
        title: 'Pedido entra na fila',
        description: 'Aguarda atendimento no gerenciador. Badge no menu mostra pendentes.',
        actor: 'sistema',
        actorLabel: 'Sistema',
        icon: Clock,
        acoes: [],
        usePending: true,
        link: { to: '/admin/requerimentos-senha', label: 'Atender pedidos' },
        branch: 'main',
      },
      {
        id: 'atendimento',
        title: 'Staff gera senha temporária',
        description: 'Professor ou admin atende o pedido e define senha provisória.',
        actor: 'staff',
        actorLabel: 'Professor / Admin',
        icon: UserCog,
        acoes: ['redefinir_senha_requerimento', 'senha.requerimento_atendido'],
        link: { to: '/admin/requerimentos-senha', label: 'Recuperação de senha' },
        branch: 'main',
      },
      {
        id: 'primeiro_acesso',
        title: 'Define senha no 1º acesso',
        description: 'Após reset, troca obrigatória em /trocar-senha no primeiro login.',
        actor: 'aluno',
        actorLabel: 'Aluno',
        icon: LogIn,
        acoes: ['senha.troca_obrigatoria'],
        branch: 'fork-left',
      },
      {
        id: 'perfil',
        title: 'Altera senha no perfil',
        description: 'Troca voluntária em /app/perfil/senha quando o aluno quiser.',
        actor: 'aluno',
        actorLabel: 'Aluno',
        icon: CheckCircle2,
        acoes: ['senha.alterar'],
        link: { to: '/app/perfil/senha', label: 'Tela do aluno' },
        branch: 'fork-right',
      },
    ],
    legendAcoes: [
      'senha.solicitacao',
      'redefinir_senha_requerimento',
      'senha.troca_obrigatoria',
      'senha.alterar',
    ],
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    description: 'Cadastro institucional, primeiro acesso, edição e ciclo de vida da conta.',
    icon: Users,
    steps: [
      {
        id: 'cadastro',
        title: 'Admin cadastra usuário',
        description:
          'Somente administrador cria contas (aluno, professor ou admin) via gerenciador.',
        actor: 'staff',
        actorLabel: 'Administrador',
        icon: UserPlus,
        acoes: ['criar_usuario', 'usuario.criar'],
        link: { to: '/admin/usuarios', label: 'Gerenciar usuários' },
        branch: 'main',
      },
      {
        id: 'primeiro_acesso',
        title: 'Usuário define senha no 1º acesso',
        description: 'Após cadastro, troca obrigatória da senha inicial.',
        actor: 'aluno',
        actorLabel: 'Usuário',
        icon: LogIn,
        acoes: ['senha.troca_obrigatoria'],
        link: { to: '/trocar-senha', label: 'Tela de 1º acesso' },
        branch: 'main',
      },
      {
        id: 'edicao',
        title: 'Admin edita dados do usuário',
        description: 'Alteração de nome, perfil ou outros dados no gerenciador.',
        actor: 'staff',
        actorLabel: 'Administrador',
        icon: Pencil,
        acoes: ['usuario.atualizar'],
        link: { to: '/admin/usuarios', label: 'Gerenciar usuários' },
        branch: 'main',
      },
      {
        id: 'desativar',
        title: 'Admin desativa conta',
        description: 'Soft delete — usuário não consegue mais entrar; dados preservados.',
        actor: 'staff',
        actorLabel: 'Administrador',
        icon: UserMinus,
        acoes: ['usuario.desativar'],
        link: { to: '/admin/usuarios', label: 'Gerenciar usuários' },
        branch: 'fork-left',
      },
      {
        id: 'reativar',
        title: 'Admin reativa conta',
        description: 'Conta inativa volta a permitir login.',
        actor: 'staff',
        actorLabel: 'Administrador',
        icon: CheckCircle2,
        acoes: ['usuario.reativar'],
        link: { to: '/admin/usuarios', label: 'Gerenciar usuários' },
        branch: 'fork-right',
      },
      {
        id: 'senha_admin',
        title: 'Admin redefine senha diretamente',
        description: 'Redefinição manual pelo administrador, fora do fluxo de pedido.',
        actor: 'staff',
        actorLabel: 'Administrador',
        icon: KeyRound,
        acoes: ['redefinir_senha_usuario', 'senha.redefinir_admin'],
        link: { to: '/admin/usuarios', label: 'Gerenciar usuários' },
        branch: 'fork-right',
      },
    ],
    legendAcoes: [
      'criar_usuario',
      'usuario.atualizar',
      'usuario.desativar',
      'usuario.reativar',
      'redefinir_senha_usuario',
      'senha.troca_obrigatoria',
    ],
  },
  {
    id: 'conteudos',
    label: 'Conteúdos',
    description: 'Publicação de obras, temas, materiais e manutenção do catálogo.',
    icon: BookOpen,
    steps: [
      {
        id: 'criar_conteudo',
        title: 'Staff cadastra conteúdo',
        description: 'Professor ou admin cria livro, poema, crônica ou música no gerenciador.',
        actor: 'staff',
        actorLabel: 'Professor / Admin',
        icon: BookOpen,
        acoes: ['conteudo.criar'],
        link: { to: '/admin/conteudos', label: 'Gerenciar conteúdos' },
        branch: 'main',
      },
      {
        id: 'criar_tema',
        title: 'Adiciona temas reflexivos',
        description: 'Temas psicológicos vinculados ao conteúdo para reflexão orientada.',
        actor: 'staff',
        actorLabel: 'Professor / Admin',
        icon: BookMarked,
        acoes: ['tema.criar'],
        link: { to: '/admin/conteudos', label: 'Gerenciar conteúdos' },
        branch: 'main',
      },
      {
        id: 'criar_material',
        title: 'Adiciona materiais complementares',
        description: 'Links externos e recursos extras para o aluno.',
        actor: 'staff',
        actorLabel: 'Professor / Admin',
        icon: FileText,
        acoes: ['material.criar'],
        link: { to: '/admin/conteudos', label: 'Gerenciar conteúdos' },
        branch: 'main',
      },
      {
        id: 'atualizar',
        title: 'Atualiza conteúdo, tema ou material',
        description: 'Edição de título, capa, textos ou links existentes.',
        actor: 'staff',
        actorLabel: 'Professor / Admin',
        icon: Pencil,
        acoes: ['conteudo.atualizar', 'tema.atualizar', 'material.atualizar'],
        link: { to: '/admin/conteudos', label: 'Gerenciar conteúdos' },
        branch: 'main',
      },
      {
        id: 'desativar',
        title: 'Desativa item do catálogo',
        description: 'Soft delete — alunos deixam de ver; registro preservado em auditoria.',
        actor: 'staff',
        actorLabel: 'Professor / Admin',
        icon: Archive,
        acoes: ['conteudo.desativar', 'tema.desativar', 'material.desativar', 'conteudo.excluir', 'tema.excluir', 'material.excluir'],
        branch: 'fork-left',
      },
      {
        id: 'reativar',
        title: 'Reativa item do catálogo',
        description: 'Conteúdo, tema ou material volta a ficar visível para alunos.',
        actor: 'staff',
        actorLabel: 'Professor / Admin',
        icon: CheckCircle2,
        acoes: ['conteudo.reativar', 'tema.reativar', 'material.reativar'],
        branch: 'fork-right',
      },
    ],
    legendAcoes: [
      'conteudo.criar',
      'tema.criar',
      'material.criar',
      'conteudo.atualizar',
      'conteudo.desativar',
      'conteudo.reativar',
    ],
  },
]

export function getSystemFlow(id: SystemFlowId): SystemFlowDefinition {
  return SYSTEM_FLOWS.find((f) => f.id === id) ?? SYSTEM_FLOWS[0]
}

export function getFlowStepLabel(flowId: SystemFlowId, stepId: string): string {
  const flow = getSystemFlow(flowId)
  return flow.steps.find((s) => s.id === stepId)?.title ?? stepId
}
