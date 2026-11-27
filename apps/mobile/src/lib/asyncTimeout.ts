/** Evita splash/auth presos quando Supabase ou SecureStore demoram demais. */
export function withTimeout<T>(promise: Promise<T>, ms: number, onTimeout: () => T): Promise<T> {
  return new Promise((resolve) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve(onTimeout())
    }, ms)

    promise
      .then((value) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(onTimeout())
      })
  })
}