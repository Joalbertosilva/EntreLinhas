const DEFAULT_WEB_URL = 'http://localhost:5173'

/** URL base do site web (gerenciador + plataforma aluno). */
export function getWebAppUrl(): string {
  const url = process.env.EXPO_PUBLIC_WEB_URL?.trim()
  return (url || DEFAULT_WEB_URL).replace(/\/$/, '')
}

/** Painel administrativo na web — staff abre no navegador do celular. */
export function getAdminWebUrl(): string {
  return `${getWebAppUrl()}/admin`
}
