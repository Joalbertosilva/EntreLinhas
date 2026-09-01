import { describe, expect, it } from 'vitest'
import {
  changePasswordSchema,
  conteudoFormSchema,
  createUserFormSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from './index'

describe('loginSchema', () => {
  it('aceita credenciais válidas', () => {
    const result = loginSchema.safeParse({ nome_usuario: 'admin', senha: '12345678' })
    expect(result.success).toBe(true)
  })

  it('rejeita usuário vazio', () => {
    const result = loginSchema.safeParse({ nome_usuario: '', senha: '12345678' })
    expect(result.success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('aceita nome de usuário válido', () => {
    const result = forgotPasswordSchema.safeParse({ nome_usuario: 'joao.silva' })
    expect(result.success).toBe(true)
  })
})

describe('resetPasswordSchema', () => {
  it('exige confirmação igual', () => {
    const result = resetPasswordSchema.safeParse({
      senha_nova: 'Nova@123456',
      senha_confirmacao: 'Nova@123456',
    })
    expect(result.success).toBe(true)
  })
})

describe('changePasswordSchema', () => {
  it('exige senha atual e confirmação igual', () => {
    const result = changePasswordSchema.safeParse({
      senha_atual: 'Antiga@123',
      senha_nova: 'Nova@123456',
      senha_confirmacao: 'Nova@123456',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita confirmação diferente', () => {
    const result = changePasswordSchema.safeParse({
      senha_atual: 'Antiga@123',
      senha_nova: 'Nova@123456',
      senha_confirmacao: 'Outra@123',
    })
    expect(result.success).toBe(false)
  })
})

describe('createUserFormSchema', () => {
  it('rejeita senhas que não coincidem', () => {
    const result = createUserFormSchema.safeParse({
      nome: 'João Silva',
      nome_usuario: 'joao.silva',
      perfil: 'aluno',
      senha: 'Senha@123',
      senha_confirmacao: 'Senha@456',
    })
    expect(result.success).toBe(false)
  })
})

describe('conteudoFormSchema', () => {
  it('aceita título e tipo mínimos', () => {
    const result = conteudoFormSchema.safeParse({
      titulo: 'Dom Casmurro',
      tipo: 'livro',
      status: true,
    })
    expect(result.success).toBe(true)
  })
})
