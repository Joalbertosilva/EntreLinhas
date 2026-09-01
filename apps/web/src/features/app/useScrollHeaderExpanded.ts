import { useEffect, useState } from 'react'

/** true quando o usuário rolou além do limiar — usado no header da home */
export function useScrollHeaderExpanded(threshold = 72) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const update = () => setExpanded(window.scrollY > threshold)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [threshold])

  return expanded
}
