/** Capa ilustrada padrão até o aluno gerar a capa conceitual. */
export const DEFAULT_OBRA_COVER_PATH = '/images/minha-obra-default-cover.png'

export function isDefaultObraCoverUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true
  const u = url.trim()
  if (u === DEFAULT_OBRA_COVER_PATH) return true
  return u.includes('minha-obra-default-cover')
}

/** Exibe a moldura ao vivo (como no editor), não só a ilustração padrão. */
export function shouldShowLiveObraCoverMoldura(
  capaUrl: string | null | undefined,
  hasCapaFoto: boolean,
): boolean {
  if (hasCapaFoto) return true
  return isDefaultObraCoverUrl(capaUrl)
}
