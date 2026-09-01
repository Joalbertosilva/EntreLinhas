import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface IndicatorRect {
  left: number
  width: number
  height: number
  top: number
}

export function useSlidingIndicator(activeId: string | null) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef(new Map<string, HTMLElement>())
  const [rect, setRect] = useState<IndicatorRect | null>(null)

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemsRef.current.set(id, el)
    else itemsRef.current.delete(id)
  }, [])

  const measure = useCallback(() => {
    if (!activeId) {
      setRect(null)
      return
    }

    const container = containerRef.current
    const item = itemsRef.current.get(activeId)
    if (!container || !item) {
      setRect(null)
      return
    }

    const containerRect = container.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()

    setRect({
      left: itemRect.left - containerRect.left + container.scrollLeft,
      width: itemRect.width,
      height: itemRect.height,
      top: itemRect.top - containerRect.top + container.scrollTop,
    })
  }, [activeId])

  useLayoutEffect(() => {
    measure()
  }, [measure, activeId])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    itemsRef.current.forEach((el) => observer.observe(el))

    window.addEventListener('resize', measure)
    container.addEventListener('scroll', measure, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      container.removeEventListener('scroll', measure)
    }
  }, [measure, activeId])

  return { containerRef, register, rect }
}
