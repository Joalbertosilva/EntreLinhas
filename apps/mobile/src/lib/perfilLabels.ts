import type { Perfil } from '@tcc-sistema/types'

export const PERFIL_LABELS: Record<Perfil, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  administrador: 'Administrador',
}

export function isStaffPerfil(perfil: Perfil | undefined): boolean {
  return perfil === 'professor' || perfil === 'administrador'
}

export function canUseMobileApp(perfil: Perfil | undefined): boolean {
  return perfil === 'aluno' || isStaffPerfil(perfil)
}
