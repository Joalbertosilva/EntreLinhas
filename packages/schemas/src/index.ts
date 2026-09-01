import { z } from 'zod';
import {
  PERFIS,
  TIPOS_CONTEUDO,
  TIPOS_INTERACAO,
  TIPOS_MATERIAL,
  TIPOS_PRODUCAO,
  STATUS_LEITURA,
} from '@tcc-sistema/types';

export const perfilSchema = z.enum(PERFIS);
export const tipoConteudoSchema = z.enum(TIPOS_CONTEUDO);
export const tipoMaterialSchema = z.enum(TIPOS_MATERIAL);
export const tipoInteracaoSchema = z.enum(TIPOS_INTERACAO);
export const statusLeituraSchema = z.enum(STATUS_LEITURA);
export const tipoProducaoSchema = z.enum(TIPOS_PRODUCAO);

/** RF002 — Login */
export const loginSchema = z.object({
  nome_usuario: z
    .string()
    .min(3, 'Nome de usuário deve ter no mínimo 3 caracteres')
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, ponto, hífen ou underscore'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

/** RF001 — Criação de usuário (admin) */
export const createUserSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório').max(200),
  nome_usuario: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  perfil: perfilSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Formulário web — confirmação de senha */
export const createUserFormSchema = createUserSchema
  .extend({
    senha_confirmacao: z.string().min(8, 'Confirme a senha'),
  })
  .refine((data) => data.senha === data.senha_confirmacao, {
    message: 'As senhas não coincidem',
    path: ['senha_confirmacao'],
  });

export type CreateUserFormInput = z.infer<typeof createUserFormSchema>;

/** RF003 — Editar usuário (admin) */
export const updateUserSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório').max(200),
  perfil: perfilSchema,
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/** RF004 — Conteúdo */
export const conteudoSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório').max(300),
  tipo: tipoConteudoSchema,
  autor: z.string().max(200).optional().nullable(),
  descricao: z.string().max(2000).optional().nullable(),
  resumo: z.string().optional().nullable(),
  personagens: z.string().optional().nullable(),
  contexto: z.string().optional().nullable(),
  pontos_importantes: z.string().optional().nullable(),
  curiosidades: z.string().optional().nullable(),
  conteudo_textual: z.string().optional().nullable(),
  capa_url: z.string().url().optional().nullable(),
  status: z.boolean().default(true),
});

export type ConteudoInput = z.infer<typeof conteudoSchema>;

/** Formulário web — aceita capa_url vazia + reflexão (salva em temas) */
export const conteudoFormSchema = conteudoSchema
  .omit({ status: true, capa_url: true })
  .extend({
    capa_url: z.union([z.string().url('URL inválida'), z.literal('')]).optional().nullable(),
    status: z.boolean(),
  reflexao_tema: z.string().max(200).optional().nullable(),
  reflexao_frase: z.string().max(1000).optional().nullable(),
  reflexao_texto: z.string().max(2000).optional().nullable(),
  reflexao_pergunta: z.string().max(500).optional().nullable(),
  });

export type ConteudoFormInput = z.infer<typeof conteudoFormSchema>;

/** RF005 — Tema psicológico/reflexivo */
export const temaSchema = z.object({
  tema: z.string().min(1, 'Tema obrigatório').max(200),
  descricao: z.string().max(2000).optional().nullable(),
  ensinamento: z.string().optional().nullable(),
  questionamento: z.string().optional().nullable(),
  status: z.boolean().default(true),
});

export const temaFormSchema = temaSchema.omit({ status: true }).extend({
  status: z.boolean(),
});

export type TemaFormInput = z.infer<typeof temaFormSchema>;

/** RF006 — Material complementar */
export const materialSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório').max(300),
  tipo: tipoMaterialSchema,
  link: z.string().url('Informe um link válido (http:// ou https://)'),
  descricao: z.string().max(2000).optional().nullable(),
  status: z.boolean().default(true),
});

export const materialFormSchema = materialSchema.omit({ status: true }).extend({
  status: z.boolean(),
});

export type MaterialFormInput = z.infer<typeof materialFormSchema>;

/** RF015 — Alteração de senha */
export const changePasswordSchema = z
  .object({
    senha_atual: z.string().min(1, 'Informe a senha atual'),
    senha_nova: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    senha_confirmacao: z.string().min(8, 'Confirme a senha'),
  })
  .refine((data) => data.senha_nova === data.senha_confirmacao, {
    message: 'As senhas não coincidem',
    path: ['senha_confirmacao'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** Solicitação de recuperação de senha */
export const forgotPasswordSchema = z.object({
  nome_usuario: z
    .string()
    .min(3, 'Nome de usuário deve ter no mínimo 3 caracteres')
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, ponto, hífen ou underscore'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/** Nova senha após link de recuperação */
export const resetPasswordSchema = z
  .object({
    senha_nova: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    senha_confirmacao: z.string().min(8, 'Confirme a senha'),
  })
  .refine((data) => data.senha_nova === data.senha_confirmacao, {
    message: 'As senhas não coincidem',
    path: ['senha_confirmacao'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Staff — atender requerimento de senha */
export const attendPasswordResetSchema = z
  .object({
    senha_temporaria: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    senha_confirmacao: z.string().min(8, 'Confirme a senha'),
  })
  .refine((data) => data.senha_temporaria === data.senha_confirmacao, {
    message: 'As senhas não coincidem',
    path: ['senha_confirmacao'],
  });

export type AttendPasswordResetInput = z.infer<typeof attendPasswordResetSchema>;

/** Converte nome_usuario para email interno do Supabase Auth */
export function nomeUsuarioToAuthEmail(nomeUsuario: string): string {
  return `${nomeUsuario.toLowerCase()}@tcc-sistema.internal`;
}

export function authEmailToNomeUsuario(email: string): string {
  return email.replace(/@tcc-sistema\.internal$/i, '');
}
