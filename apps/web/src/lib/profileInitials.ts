const NAME_PARTICLES = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

/** Iniciais para avatar — duas primeiras palavras do nome (ignora partículas). */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'

  const significant = parts.filter((part) => !NAME_PARTICLES.has(part.toLowerCase()))
  const use = significant.length >= 2 ? significant : parts

  const first = use[0]?.[0] ?? ''
  const second = use[1]?.[0] ?? use[0]?.[1] ?? ''

  const pair = (first + second).toUpperCase()
  return pair || '?'
}
