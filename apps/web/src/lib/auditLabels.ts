export type AuditCategoria = 'all' | 'senha' | 'usuarios' | 'conteudos' | 'outros'

const ACAO_LABELS: Record<string, string> = {
  criar_usuario: 'Usuário criado',
  'usuario.criar': 'Usuário criado',
  'usuario.atualizar': 'Usuário atualizado',
  'usuario.desativar': 'Usuário desativado',
  'usuario.reativar': 'Usuário reativado',
  'conteudo.criar': 'Conteúdo criado',
  'conteudo.atualizar': 'Conteúdo atualizado',
  'conteudo.desativar': 'Conteúdo desativado',
  'conteudo.reativar': 'Conteúdo reativado',
  'conteudo.excluir': 'Conteúdo desativado',
  'tema.criar': 'Tema criado',
  'tema.atualizar': 'Tema atualizado',
  'tema.desativar': 'Tema desativado',
  'tema.reativar': 'Tema reativado',
  'tema.excluir': 'Tema desativado',
  'material.criar': 'Material criado',
  'material.atualizar': 'Material atualizado',
  'material.desativar': 'Material desativado',
  'material.reativar': 'Material reativado',
  'material.excluir': 'Material desativado',
  'senha.solicitacao': 'Pedido de recuperação de senha',
  redefinir_senha_requerimento: 'Senha redefinida (pedido atendido)',
  'senha.requerimento_atendido': 'Senha redefinida (pedido atendido)',
  redefinir_senha_usuario: 'Senha redefinida pelo administrador',
  'senha.redefinir_admin': 'Senha redefinida pelo administrador',
  'senha.alterar': 'Senha alterada (perfil)',
  'senha.troca_obrigatoria': 'Senha definida no primeiro acesso',
}

export const AUDIT_CATEGORIA_FILTERS: Array<{ value: AuditCategoria; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'senha', label: 'Senhas' },
  { value: 'usuarios', label: 'Usuários' },
  { value: 'conteudos', label: 'Conteúdos' },
  { value: 'outros', label: 'Outras' },
]

export function labelAcaoAuditoria(acao: string): string {
  return ACAO_LABELS[acao] ?? acao.replaceAll('.', ' · ').replaceAll('_', ' ')
}

export function categoriaAcaoAuditoria(acao: string): Exclude<AuditCategoria, 'all'> {
  const a = acao.toLowerCase()
  if (a.includes('senha') || a.includes('redefinir_senha')) return 'senha'
  if (a.includes('usuario') || a === 'criar_usuario') return 'usuarios'
  if (a.includes('conteudo') || a.includes('tema') || a.includes('material')) return 'conteudos'
  return 'outros'
}

export function formatDetalhesAuditoria(detalhes: Record<string, unknown> | null): string {
  if (!detalhes) return '—'

  const parts: string[] = []

  if (typeof detalhes.nome_usuario === 'string') {
    parts.push(`@${detalhes.nome_usuario}`)
  }
  if (typeof detalhes.titulo === 'string') {
    parts.push(detalhes.titulo)
  }
  if (typeof detalhes.nome === 'string' && typeof detalhes.titulo !== 'string') {
    parts.push(detalhes.nome)
  }
  if (typeof detalhes.perfil === 'string') {
    parts.push(`perfil: ${detalhes.perfil}`)
  }
  if (typeof detalhes.tema === 'string') {
    parts.push(String(detalhes.tema))
  }
  if (typeof detalhes.origem === 'string' && detalhes.origem === 'esqueci_senha') {
    parts.push('via Esqueci minha senha')
  }

  return parts.length > 0 ? parts.join(' · ') : '—'
}

export function labelExecutorAuditoria(
  usuario: { nome: string; nome_usuario: string } | null,
  acao: string,
): string {
  if (usuario) return usuario.nome
  if (acao === 'senha.solicitacao') return 'Aluno (sem sessão)'
  return 'Sistema'
}
