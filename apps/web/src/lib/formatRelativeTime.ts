/** Tempo relativo simples em português (sem dependência externa). */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'agora'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return diffMin === 1 ? 'há 1 minuto' : `há ${diffMin} minutos`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return diffHours === 1 ? 'há 1 hora' : `há ${diffHours} horas`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return diffDays === 1 ? 'há 1 dia' : `há ${diffDays} dias`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return diffWeeks === 1 ? 'há 1 semana' : `há ${diffWeeks} semanas`

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
