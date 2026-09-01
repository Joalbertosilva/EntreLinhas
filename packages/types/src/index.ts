/** Perfis de acesso — RF001, RF002 */
export const PERFIS = ['aluno', 'professor', 'administrador'] as const;
export type Perfil = (typeof PERFIS)[number];

/** Tipos de conteúdo — RF004 */
export const TIPOS_CONTEUDO = [
  'livro',
  'cronica',
  'poema',
  'musica',
  'frase',
  'outro',
] as const;
export type TipoConteudo = (typeof TIPOS_CONTEUDO)[number];

/** Tipos de material complementar — RF006 */
export const TIPOS_MATERIAL = ['video', 'audio', 'pagina_externa', 'outro'] as const;
export type TipoMaterial = (typeof TIPOS_MATERIAL)[number];

/** Tipos de interação — RF008 */
export const TIPOS_INTERACAO = ['comentario_livre', 'reflexao_orientada'] as const;
export type TipoInteracao = (typeof TIPOS_INTERACAO)[number];

/** Status de leitura — RF009 */
export const STATUS_LEITURA = ['em_andamento', 'concluido'] as const;
export type StatusLeitura = (typeof STATUS_LEITURA)[number];

/** Tipos de produção — RF011 */
export const TIPOS_PRODUCAO = [
  'conto',
  'poema',
  'cronica',
  'reflexao',
  'capitulo',
  'outro',
] as const;
export type TipoProducao = (typeof TIPOS_PRODUCAO)[number];

export interface Profile {
  id: string;
  nome: string;
  nome_usuario: string;
  perfil: Perfil;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export const PASSWORD_RESET_REQUEST_STATUS = ['pendente', 'atendido', 'cancelado'] as const;
export type PasswordResetRequestStatus = (typeof PASSWORD_RESET_REQUEST_STATUS)[number];

export interface PasswordResetRequest {
  id: string;
  profile_id: string;
  nome_usuario: string;
  status: PasswordResetRequestStatus;
  atendido_por: string | null;
  atendido_em: string | null;
  created_at: string;
}

export interface PasswordResetRequestWithProfile extends PasswordResetRequest {
  profiles: Pick<Profile, 'nome' | 'perfil'> | null;
}

export interface Conteudo {
  id: string;
  titulo: string;
  tipo: TipoConteudo;
  autor: string | null;
  descricao: string | null;
  resumo: string | null;
  personagens: string | null;
  contexto: string | null;
  pontos_importantes: string | null;
  curiosidades: string | null;
  conteudo_textual: string | null;
  capa_url: string | null;
  status: boolean;
  curtidas_count?: number;
  responsavel_id: string;
  created_at: string;
  updated_at: string;
}

export interface Tema {
  id: string;
  conteudo_id: string;
  tema: string;
  descricao: string | null;
  ensinamento: string | null;
  questionamento: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialComplementar {
  id: string;
  conteudo_id: string;
  titulo: string;
  tipo: TipoMaterial;
  link: string;
  descricao: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface Interacao {
  id: string;
  usuario_id: string;
  conteudo_id: string;
  tipo_interacao: TipoInteracao;
  tema_id: string | null;
  texto: string;
  created_at: string;
  updated_at: string;
}

export interface InteracaoComAutor extends Interacao {
  profiles: Pick<Profile, 'nome'> | null;
}
